import { shuffle } from "."

export enum GameState {
  NOT_STARTED,
  CHOOSING,
  TSAR_VERDICT
}

export interface BlackCard {
  id: number
  pick?: number | null
  draw?: number | null
}

export type CurBlackCard = Required<BlackCard>

export interface PlayerOpts<M> {
  game: Game<M>
  metadata?: M
}

export interface WinnerData<PM> {
  winner: Player<PM>
  blackCard: number
  winningCards: number[]
}

export type Podium<PM> = Array<{ metadata?: PM; points: number }>

export class Player<M = unknown> {
  game: Game<M>
  metadata: M | undefined
  points: number
  cards: number[]
  choice: number[]

  constructor(opts: PlayerOpts<M>) {
    this.game = opts.game
    this.metadata = opts.metadata
    this.points = 0
    this.cards = []
    this.choice = []
  }

  get isTsar(): boolean {
    return this.game.tsar === this
  }

  get chose(): boolean {
    return this.game.curBlackCard?.pick === this.choice.length
  }

  removeCards(cards: number[]) {
    const removed: Array<number | null> = new Array(cards.length).fill(null)
    const filteredCards: number[] = []

    for (const card of this.cards) {
      const idx = cards.indexOf(card)

      if (idx < 0) {
        filteredCards.push(card)
      } else {
        removed[idx] = card
      }
    }

    if (removed.includes(null)) throw new Error("There are non existing cards")

    this.cards = filteredCards

    return removed as number[]
  }

  choose(cards: number[]) {
    if (this.isTsar) throw Error("Cannot choose as tsar")
    if (this.game.curBlackCard?.pick !== cards.length)
      throw Error("Invalid number of cards")

    this.choice = this.removeCards(cards)

    if (this.game.everyoneChose()) {
      this.game.state = GameState.TSAR_VERDICT
    }
  }

  makeVerdict(choice: number[]): WinnerData<M> {
    if (this.game.state !== GameState.TSAR_VERDICT || !this.game.curBlackCard)
      throw new Error("Not TSAR VERDICT state")
    if (!this.isTsar) throw new Error("Player is not a tsar")

    for (const player of this.game.players) {
      if (Game.hashChoice(player.choice) !== Game.hashChoice(choice)) continue

      player.points++

      return {
        winner: player,
        blackCard: this.game.curBlackCard.id,
        winningCards: player.choice
      }
    }

    throw Error("No player with this choice")
  }
}

export interface GameOpts {
  whiteCards?: number[]
  blackCards?: BlackCard[]
  maxCards?: number
}

export class Game<PM = unknown> {
  state: GameState

  whiteCards: number[]
  blackCards: BlackCard[]
  curBlackCard: CurBlackCard | null

  tsar: Player<PM> | null
  players: Player<PM>[]

  maxCards: number

  constructor(opts?: GameOpts) {
    this.state = GameState.NOT_STARTED

    this.whiteCards = opts?.whiteCards || []
    this.blackCards = opts?.blackCards || []
    this.curBlackCard = null

    this.tsar = null
    this.players = []

    this.maxCards = opts?.maxCards || 10
  }

  static hashChoice(choice: number[]) {
    return [...choice].sort((a, b) => a - b).join("-")
  }

  setCards(whiteCards: number[], blackCards: BlackCard[]) {
    if (this.state !== GameState.NOT_STARTED)
      throw new Error("The game has already started")

    this.whiteCards = whiteCards
    this.blackCards = blackCards
  }

  // TODO: improve check (ex. take 'draw' param into account)
  enoughCards() {
    return (
      this.blackCards.length &&
      this.whiteCards.length >= this.players.length * this.maxCards
    )
  }

  addPlayer(metadata?: PM): Player<PM> {
    const player = new Player({ game: this, metadata })
    this.players.push(player)
    if (this.state !== GameState.NOT_STARTED) this.dealCards()
    return player
  }

  removePlayer(player: Player) {
    this.players = this.players.filter(p => p !== player)
  }

  start() {
    if (this.state !== GameState.NOT_STARTED)
      throw new Error("The game has already started")

    if (this.players.length < 2) throw new Error("Not enough players")

    this.whiteCards = shuffle(this.whiteCards)
    this.blackCards = shuffle(this.blackCards)

    this.players = shuffle(this.players)
    this.dealCards()

    this.state = GameState.CHOOSING
    this.newRound()
  }

  // TODO: make sure to deal evenly
  dealCards() {
    const additionalCards = this.curBlackCard?.draw
      ? this.curBlackCard.draw - 1
      : 0

    const target = this.maxCards + additionalCards

    for (const player of this.players) {
      while (player.cards.length + player.choice.length < target) {
        const newCard = this.whiteCards.pop()
        if (!newCard) break
        player.cards.push(newCard)
      }
    }
  }

  /**
   * @returns boolean that indicates whether the game can continue
   */
  newRound() {
    if (this.state === GameState.NOT_STARTED)
      throw new Error("Game is not started")

    if (!this.enoughCards()) return false

    this.state = GameState.CHOOSING

    this.players.forEach(p => (p.choice = []))

    this.dealCards()

    // choose new tsar
    if (this.tsar) {
      const curTsarIdx = this.players.indexOf(this.tsar)
      this.tsar = this.players[(curTsarIdx + 1) % this.players.length]
    } else {
      this.tsar = this.players[0]
    }

    const newBlackCard = this.blackCards.pop() ?? null
    this.curBlackCard = newBlackCard
      ? {
        id: newBlackCard.id,
        pick: newBlackCard.pick ?? 1,
        draw: newBlackCard.draw ?? 1
      }
      : null

    return true
  }

  getChoices() {
    const choices = []

    for (const player of this.players)
      if (!player.isTsar) choices.push(player.choice)

    return choices
  }

  everyoneChose(): boolean {
    return this.players.every(p => p.choice.length || p.isTsar)
  }

  end() {
    const podium: Podium<PM> = this.players
      .map(p => ({
        meta: p.metadata,
        points: p.points
      }))
      .sort((a, b) => b.points - a.points)

    this.state = GameState.NOT_STARTED

    this.tsar = null
    this.curBlackCard = null

    for (const player of this.players) {
      player.cards = []
      player.choice = []
      player.points = 0
    }

    return podium
  }
}
