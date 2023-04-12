import { nanoid } from "nanoid"
import db from "./db"
import logger from "./logger"

import { VOTING_TIME } from "../consts"

import { shuffle } from "../utils"
import { Game, GameState, Player, Podium, WinnerData } from "../utils/game"

import type { User } from "@prisma/client"
import {
  ApiWhiteCard,
  ExtendedReq,
  PrevRound,
  SocketClient,
  SocketServer,
  SyncData,
  VotingData,
  VotingMeta
} from "../types"

export interface PlayerMetadata {
  connected: boolean
  socket: SocketClient
  user: User
  joinedAt: number
}

type EmptyRoomCallback = () => void

interface Voting {
  meta: VotingMeta
  for: Player<PlayerMetadata>[]
  against: Player<PlayerMetadata>[]
  createdAt: number
  createdBy: string
}

export class Room {
  playersLimit: number
  timeLimit: number | null
  scoreLimit: number | null
  roundLimit: number | null

  currentVoting: Voting | null

  constructor(
    public id: string,
    public creator: number,
    public game: Game<PlayerMetadata>,
    public io: SocketServer,
    public onEmpty: EmptyRoomCallback
  ) {
    this.playersLimit = Infinity
    this.timeLimit = null
    this.scoreLimit = null
    this.roundLimit = null

    this.currentVoting = null
  }

  newConnection(socket: SocketClient, user: User) {
    const foundPlayer = this.game.players.find(
      p => p.metadata?.user.id === user.id
    )

    let player: Player<PlayerMetadata>

    if (foundPlayer) {
      player = foundPlayer
      player.metadata?.socket.disconnect()
      player.metadata = {
        socket,
        user,
        connected: true,
        joinedAt: player.metadata?.joinedAt ?? Date.now()
      }
    } else {
      // todo: connection before game start
      if (this.game.players.length >= this.playersLimit) {
        return socket.disconnect()
      }

      player = this.game.addPlayer({
        socket,
        user,
        connected: true,
        joinedAt: Date.now()
      })
    }

    socket.join(this.id)

    this.sendSyncData(player)
    this.sendPlayers()

    socket.on("start", async settings => {
      if (this.getLeader() !== player) return

      this.playersLimit = settings.playersLimit
      this.scoreLimit = settings.scoreLimit
      this.timeLimit = settings.timeLimit

      const whiteCards = await db.whiteCard.findMany({
        where: { packId: { in: settings.packs } },
        select: { id: true }
      })

      const blackCards = await db.blackCard.findMany({
        where: { packId: { in: settings.packs } },
        select: { id: true, pick: true }
      })

      try {
        this.game.setCards(
          whiteCards.map(c => c.id),
          blackCards
        )
        this.game.start()

        this.sendNewRound()
      } catch (err) {
        logger.error(err)
      }
    })

    socket.on("submit", async ({ submition }) => {
      try {
        player.choose(submition)
      } catch (err) {
        logger.error(err)
        return
      }

      this.sendPlayers()

      if (this.game.state !== GameState.TSAR_VERDICT) return

      this.sendChoices()
    })

    socket.on("verdict", ({ verdict }) => {
      try {
        const winnerData = player.makeVerdict(verdict)

        if (
          this.scoreLimit !== null &&
          winnerData.winner.points >= this.scoreLimit
        ) {
          const podium = this.game.end()
          this.sendGameEnd(podium)
          return
        }

        const canContinue = this.game.newRound()

        if (canContinue) {
          this.sendNewRound(winnerData)
        } else {
          const podium = this.game.end()
          this.sendGameEnd(podium)
        }
      } catch (err) {
        logger.error(err)
      }
    })

    socket.on("vote", data => {
      if (this.game.state === GameState.NOT_STARTED) return

      if (
        this.currentVoting &&
        Date.now() - this.currentVoting.createdAt > VOTING_TIME
      ) {
        this.currentVoting = null
      }

      if (typeof data === "boolean") {
        if (
          this.currentVoting === null ||
          [...this.currentVoting.for, ...this.currentVoting.against].includes(
            player
          )
        )
          return

        if (data) {
          this.currentVoting.for.push(player)
        } else {
          this.currentVoting.against.push(player)
        }

        if (
          this.currentVoting.for.length + this.currentVoting.against.length >=
          this.game.players.filter(p => p.metadata?.connected).length
        ) {
          if (
            this.currentVoting.for.length > this.currentVoting.against.length
          ) {
            switch (this.currentVoting.meta.type) {
              case "end": {
                const podium = this.game.end()
                this.sendGameEnd(podium)
                break
              }

              case "kick": {
                break
              }

              default: {
                break
              }
            }
          }

          this.currentVoting = null
          this.sendVoting()
          return
        }
      } else {
        let validatedMeta: VotingMeta

        if (data.type === "end") {
          validatedMeta = { type: data.type }
        } else if (data.type === "kick") {
          if (
            !this.game.players.some(p => p.metadata?.user.id === data.playerId)
          )
            return

          validatedMeta = { type: data.type, playerId: data.playerId }
        } else {
          return
        }

        this.currentVoting = {
          meta: validatedMeta,
          for: [player],
          against: [],
          createdAt: Date.now(),
          createdBy: player.metadata?.user.name ?? ""
        }
      }

      this.sendVoting()
    })

    socket.on("disconnect", () => {
      logger.info(
        `Socket with user id: '${player.metadata?.user.id}' disconnected from room with id: '${this.id}'`
      )

      if (player.metadata) player.metadata.connected = false

      if (this.game.players.every(p => !p.metadata?.connected)) {
        this.onEmpty()
      } else {
        if (this.game.state === GameState.NOT_STARTED) {
          this.game.removePlayer(player)
        }

        this.sendPlayers()
      }

      db.bumpAnonymousUser(user, false)
    })
  }

  getLeader() {
    let leader: Player<PlayerMetadata> | null = null

    for (const player of this.game.players) {
      if (
        player.metadata?.user.id === this.creator &&
        player.metadata.connected
      ) {
        return player
      }

      if (!player.metadata) continue

      if (
        (!leader?.metadata ||
          player.metadata.joinedAt > leader.metadata.joinedAt) &&
        player.metadata.connected
      ) {
        leader = player
      }
    }

    return leader
  }

  sendPlayers() {
    const leader = this.getLeader()

    const players = this.game.players.map(p => ({
      userId: p.metadata?.user.id ?? -1,
      name: p.metadata?.user.name ?? "Unknown",
      picture: p.metadata?.user.picture ?? "",
      leader: leader === p,
      connected: p.metadata?.connected ?? false,
      tsar: p.isTsar,
      ready: p.chose,
      points: p.points
    }))

    this.io.to(this.id).emit("players", { players })
  }

  async sendNewRound(winnerData?: WinnerData<PlayerMetadata>) {
    const { game } = this
    if (!game.curBlackCard) throw new Error("No black card")

    const blackCard = await db.getApiBlackCard(game.curBlackCard.id)

    const allPlayersCardsIds = game.players.map(p => p.cards)

    const allPlayersCards = (await db.mapIdsToApiWhiteCards(
      allPlayersCardsIds
    )) as ApiWhiteCard[][]

    let prevRound: PrevRound | undefined

    if (winnerData) {
      const prevRoundBlack = await db.getApiBlackCard(winnerData.blackCard)
      const winningCards = (await db.mapIdsToApiWhiteCards(
        winnerData.winningCards
      )) as ApiWhiteCard[]

      prevRound = {
        winner: winnerData.winner.metadata?.user.name ?? "Unknown",
        blackCard: prevRoundBlack,
        winningCards,
        imWinner: false
      }
    }

    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i]
      const cards = allPlayersCards[i]

      if (prevRound) {
        prevRound.imWinner = player === winnerData?.winner
      }

      player.metadata?.socket.emit("new-round", {
        blackCard,
        cards,
        tsar: player.isTsar,
        prevRound
      })
    }

    this.sendPlayers()
  }

  async sendChoices() {
    const choices = (await db.mapIdsToApiWhiteCards(
      this.game.getChoices()
    )) as ApiWhiteCard[][]

    shuffle(choices)

    this.io.to(this.id).emit("choices", { choices })
  }

  async sendSyncData(player: Player<PlayerMetadata>) {
    const { game } = player

    if (game.state === GameState.NOT_STARTED) {
      player.metadata?.socket.emit("sync", { started: false })
      return
    }

    if (!game.curBlackCard) return

    const blackCard = await db.getApiBlackCard(game.curBlackCard.id)

    const cards = (await db.mapIdsToApiWhiteCards(
      player.cards
    )) as ApiWhiteCard[]

    let choices: ApiWhiteCard[][] | undefined

    if (game.state === GameState.TSAR_VERDICT) {
      choices = (await db.mapIdsToApiWhiteCards(
        game.getChoices()
      )) as ApiWhiteCard[][]
    }

    let voting: VotingData | null

    if (
      !this.currentVoting ||
      Date.now() - this.currentVoting.createdAt > VOTING_TIME
    ) {
      voting = null
    } else {
      voting = this.parseVoting(player)
    }

    const data: SyncData = {
      started: true,
      tsar: player.isTsar,
      blackCard,
      cards,
      choices,
      voting
    }

    player.metadata?.socket.emit("sync", data)
  }

  sendGameEnd(podium: Podium<PlayerMetadata>) {
    this.io.to(this.id).emit("end", {
      podium: podium.map((pel, i) => ({
        place: i + 1,
        name: pel.metadata?.user.name || "?",
        picture: pel.metadata?.user.picture || "",
        points: pel.points
      }))
    })
  }

  parseVoting(player: Player<PlayerMetadata>): VotingData {
    if (!this.currentVoting) throw new Error("Invalid usage of parseVoting")

    let vote: null | boolean = null

    if (this.currentVoting.for.includes(player)) vote = true
    if (this.currentVoting.against.includes(player)) vote = false

    return {
      endsInMs: VOTING_TIME - (Date.now() - this.currentVoting.createdAt),
      by: this.currentVoting.createdBy,
      voting: this.currentVoting.meta,
      for: this.currentVoting.for.length,
      against: this.currentVoting.against.length,
      vote
    }
  }

  sendVoting() {
    if (!this.currentVoting) return this.io.to(this.id).emit("voting", null)

    for (const player of this.game.players) {
      player.metadata?.socket.emit("voting", this.parseVoting(player))
    }
  }
}

export class Rooms {
  rooms: Map<string, Room | undefined>

  constructor(public io: SocketServer) {
    this.rooms = new Map()

    this.io.on("connection", async socket => {
      const userId = (socket.request as ExtendedReq).session?.passport?.user
      if (!userId) return socket.disconnect()

      const user = await db.user.findUnique({ where: { id: userId } })

      if (!user) return socket.disconnect()

      const { roomId } = socket.handshake.auth as { roomId?: string }
      if (!roomId) return socket.disconnect()
      const room = this.rooms.get(roomId)
      if (!room) return socket.disconnect()

      logger.info(
        `User with id: '${user.id}' connected to room with id: '${roomId}'`
      )

      try {
        await db.bumpAnonymousUser(user, true)
      } catch (err) {
        logger.error(err)
      }

      room.newConnection(socket, user)
    })
  }

  createRoom(creatorId: number) {
    let roomId = ""

    while (this.rooms.has(roomId) || !roomId) roomId = nanoid(16)

    this.rooms.set(
      roomId,
      new Room(roomId, creatorId, new Game(), this.io, () => {
        logger.info(`Deleting room with id: '${roomId}'`)
        this.deleteRoom(roomId)
      })
    )

    return roomId
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId)
  }
}
