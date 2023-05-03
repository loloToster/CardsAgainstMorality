import { nanoid } from "nanoid"
import db from "./db"
import logger from "./logger"

import { TIME_LIMIT_OFFSET, VOTING_TIME } from "../consts"

import { randomElement, shuffle } from "../utils/random"
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

import { validate as validateSocketMessage } from "../dtos/sockets"

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

const errWrapper = <T extends (...args: any[]) => any>(cb: T): T => {
  return ((...args: Parameters<T>) => {
    try {
      const returnedVal = cb(...args)

      if (!(returnedVal instanceof Promise)) return returnedVal

      return returnedVal.catch(err => logger.error(err?.message ?? err))
    } catch (err: any) {
      logger.error(err?.message ?? err)
    }
  }) as T
}

export class Room {
  playersLimit: number
  timeLimit: number | null
  scoreLimit: number | null
  roundLimit: number | null

  timeLimitStart: number | null
  timeLimitTimeout: ReturnType<typeof setTimeout> | undefined

  currentVoting: Voting | null
  votingTimeout: ReturnType<typeof setTimeout> | undefined

  kickedPlayers: number[]

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

    this.timeLimitStart = null
    this.timeLimitTimeout = undefined

    this.currentVoting = null
    this.votingTimeout = undefined

    this.kickedPlayers = []
  }

  getTimeLimitSeconds() {
    if (this.timeLimit === null || !this.timeLimitStart) return null

    return Math.round(
      (this.timeLimit - (Date.now() - this.timeLimitStart)) / 1000
    )
  }

  async newConnection(socket: SocketClient, user: User) {
    let foundPlayer: Player<PlayerMetadata> | null =
      this.game.players.find(p => p.metadata?.user.id === user.id) ?? null

    if (foundPlayer) {
      foundPlayer.metadata?.socket.disconnect()
      foundPlayer.metadata = {
        socket,
        user,
        connected: true,
        joinedAt: foundPlayer.metadata?.joinedAt ?? Date.now()
      }
    } else {
      // todo: connection before game start
      if (
        this.game.players.length >= this.playersLimit ||
        this.kickedPlayers.includes(user.id)
      ) {
        return socket.disconnect()
      }

      foundPlayer = this.game.addPlayer({
        socket,
        user,
        connected: true,
        joinedAt: Date.now()
      })
    }

    if (!foundPlayer) return
    const player = foundPlayer

    socket.join(this.id)

    await this.sendSyncData(player)
    this.sendPlayers()

    socket.use(async ([ev, data], next) => {
      // ! this does not validate everything
      // it only validates types and predefined limits
      try {
        await validateSocketMessage(ev, data)
        next()
      } catch {
        logger.warn(
          `user with id: '${user.id}' sent a message that could not be validated`
        )
      }
    })

    socket.on(
      "start",
      errWrapper(async settings => {
        if (this.getLeader() !== player) return

        this.timeLimit =
          settings.timeLimit === null ? null : settings.timeLimit * 1000
        this.playersLimit = settings.playersLimit
        this.scoreLimit = settings.scoreLimit
        this.roundLimit = settings.roundLimit

        const whiteCards = await db.whiteCard.findMany({
          where: { packId: { in: settings.packs } },
          select: { id: true }
        })

        const blackCards = await db.blackCard.findMany({
          where: { packId: { in: settings.packs } },
          select: { id: true, pick: true, draw: true }
        })

        try {
          this.game.setCards(
            whiteCards.map(c => c.id),
            blackCards
          )

          this.game.start()

          await this.sendNewRound()
        } catch (err) {
          logger.error(err)
        }
      })
    )

    socket.on(
      "submit",
      errWrapper(async ({ submition }) => {
        player.choose(submition)
        this.sendPlayers()

        if (this.game.state !== GameState.TSAR_VERDICT) return

        await this.sendChoices()
      })
    )

    socket.on(
      "verdict",
      errWrapper(async ({ verdict }) => {
        await this.onMakeVerdict(player, verdict)
      })
    )

    socket.on(
      "vote-start",
      errWrapper(data => {
        if (this.game.state === GameState.NOT_STARTED) return

        if (
          this.currentVoting &&
          Date.now() - this.currentVoting.createdAt > VOTING_TIME
        ) {
          this.currentVoting = null
        }

        if (this.currentVoting) return

        let validatedMeta: VotingMeta
        const against: Player<PlayerMetadata>[] = []

        if (data.type === "end") {
          validatedMeta = { type: data.type }
        } else if (data.type === "kick") {
          const playerToKick = this.game.players.find(
            p => p.metadata?.user.id === data.playerId
          )

          if (!playerToKick || this.game.players.length < 3) return

          against.push(playerToKick)
          validatedMeta = { type: data.type, playerId: data.playerId }
        } else {
          return
        }

        this.currentVoting = {
          meta: validatedMeta,
          for: [player],
          against,
          createdAt: Date.now(),
          createdBy: player.metadata?.user.name ?? ""
        }

        clearTimeout(this.votingTimeout)
        this.votingTimeout = setTimeout(
          errWrapper(this.onVotingTimeout.bind(this)),
          VOTING_TIME // todo: set with game settings
        )

        this.sendVoting()
      })
    )

    socket.on(
      "vote",
      errWrapper(async data => {
        if (this.game.state === GameState.NOT_STARTED) return

        if (
          this.currentVoting &&
          Date.now() - this.currentVoting.createdAt > VOTING_TIME
        ) {
          this.currentVoting = null
        }

        if (
          this.currentVoting === null ||
          [...this.currentVoting.for, ...this.currentVoting.against].includes(
            player
          )
        )
          return

        if (data.vote) {
          this.currentVoting.for.push(player)
        } else {
          this.currentVoting.against.push(player)
        }

        if (
          this.currentVoting.for.length + this.currentVoting.against.length >=
          this.game.players.filter(p => p.metadata?.connected).length
        ) {
          return await this.resolveVoting()
        }

        this.sendVoting()
      })
    )

    socket.on(
      "disconnect",
      errWrapper(async () => {
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

        await db.bumpAnonymousUser(user, false)
      })
    )
  }

  startTimeout(func: () => void) {
    this.timeLimitStart = Date.now()
    const timeLimitSeconds = this.getTimeLimitSeconds()

    if (this.timeLimit) {
      clearTimeout(this.timeLimitTimeout)
      this.timeLimitTimeout = setTimeout(
        errWrapper(func.bind(this)),
        this.timeLimit + TIME_LIMIT_OFFSET
      )
    }

    return timeLimitSeconds
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

  sendPlayers(kickedPlayer?: Player) {
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

    this.io.to(this.id).emit("players", {
      players,
      kickedChoice: kickedPlayer?.choice
    })
  }

  async onMakeVerdict(
    player: Player<PlayerMetadata>,
    verdict: number[],
    timedOut = false
  ) {
    const winnerData = player.makeVerdict(verdict)

    clearTimeout(this.timeLimitTimeout)

    if (
      (this.scoreLimit !== null &&
        winnerData.winner.points >= this.scoreLimit) ||
      (this.roundLimit !== null &&
        this.game.players.reduce((acc, p) => acc + p.points, 0) >=
          this.roundLimit)
    ) {
      const podium = this.game.end()
      this.sendGameEnd(podium)
      return
    }

    const canContinue = this.game.newRound()

    if (canContinue) {
      await this.sendNewRound({ ...winnerData, randomlyPicked: timedOut })
    } else {
      const podium = this.game.end()
      this.sendGameEnd(podium)
    }
  }

  async onVerdictTimeout() {
    if (!this.game.tsar) return

    await this.onMakeVerdict(
      this.game.tsar,
      randomElement(
        this.game.players.filter(p => !p.isTsar).map(p => p.choice)
      ),
      true
    )
  }

  async sendNewRound(
    winnerData?: WinnerData<PlayerMetadata> & { randomlyPicked: boolean },
    roundRestart = false
  ) {
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
        imWinner: false,
        randomlyPicked: winnerData.randomlyPicked
      }
    }

    const timeLimitSeconds = this.startTimeout(this.onChoiceTimeout)

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
        prevRound,
        timeLimit: timeLimitSeconds,
        roundRestart
      })
    }

    this.sendPlayers()
  }

  async onChoiceTimeout() {
    if (!this.game.curBlackCard || this.game.state !== GameState.CHOOSING)
      return

    const afkPlayers: Player<PlayerMetadata>[] = []

    for (const player of this.game.players) {
      if (player.chose || player.isTsar) continue

      const randomChoice = shuffle([...player.cards]).slice(
        0,
        this.game.curBlackCard.pick
      )

      player.choose(randomChoice)
      afkPlayers.push(player)
    }

    await this.sendChoices(afkPlayers)
  }

  async sendChoices(afkPlayers?: Player<PlayerMetadata>[]) {
    clearTimeout(this.timeLimitTimeout)

    const choices = (await db.mapIdsToApiWhiteCards(
      this.game.getChoices()
    )) as ApiWhiteCard[][]

    const timeLimitSeconds = this.startTimeout(this.onVerdictTimeout)

    if (afkPlayers) {
      for (const player of this.game.players) {
        player.metadata?.socket.emit("choices", {
          choices,
          pickedCards: afkPlayers.includes(player) ? player.choice : undefined,
          timeLimit: timeLimitSeconds
        })
      }
    } else {
      this.io
        .to(this.id)
        .emit("choices", { choices, timeLimit: timeLimitSeconds })
    }
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

    const timeLimitSeconds = this.getTimeLimitSeconds()

    const data: SyncData = {
      started: true,
      tsar: player.isTsar,
      blackCard,
      cards,
      choices,
      submitted: player.chose,
      voting,
      timeLimit: timeLimitSeconds
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

  async onVotingTimeout() {
    if (this.currentVoting) await this.resolveVoting()
  }

  async resolveVoting() {
    clearTimeout(this.votingTimeout)

    if (
      this.currentVoting &&
      this.currentVoting.for.length > this.currentVoting.against.length
    ) {
      switch (this.currentVoting.meta.type) {
        case "end": {
          const podium = this.game.end()
          this.sendGameEnd(podium)
          break
        }

        case "kick": {
          const kickedPlayerId = this.currentVoting.meta.playerId
          const kickedPlayer = this.game.players.find(
            p => p.metadata?.user.id === kickedPlayerId
          )

          if (!kickedPlayer) break

          const playerWasTsar = kickedPlayer.isTsar
          this.kickedPlayers.push(kickedPlayerId)
          this.game.removePlayer(kickedPlayer)
          kickedPlayer.metadata?.socket.disconnect()

          if (playerWasTsar) {
            await this.sendNewRound(undefined, true)
          } else {
            this.sendPlayers(kickedPlayer)
          }
          break
        }

        default: {
          break
        }
      }
    }

    this.currentVoting = null
    this.sendVoting()
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

  cleanup() {
    this.game.players.forEach(p => p.metadata?.socket.disconnect())
    clearTimeout(this.timeLimitTimeout)
    clearTimeout(this.votingTimeout)
  }
}

export class Rooms {
  rooms: Map<string, Room | undefined>

  constructor(public io: SocketServer) {
    this.rooms = new Map()

    this.io.on(
      "connection",
      errWrapper(async socket => {
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

        await room.newConnection(socket, user)
      })
    )
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
    const room = this.rooms.get(roomId)
    if (!room) return
    room.cleanup()
    this.rooms.delete(roomId)
  }
}
