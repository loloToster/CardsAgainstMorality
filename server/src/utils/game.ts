import { shuffle } from "./random"

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

type NonNullableObj<T extends object> = { [K in keyof T]: NonNullable<T[K]> }
export type CurBlackCard = NonNullableObj<Required<BlackCard>>

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

  remove() {
    this.game.removePlayer(this)
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

  enoughCards() {
    const nextBlack = this.blackCards[0]
    if (!nextBlack) return false

    const cardsPerPlayer = this.maxCards + (nextBlack.draw ?? 0)

    return this.whiteCards.length >= this.players.length * cardsPerPlayer
  }

  newBlackCard() {
    const newBlackCard = this.blackCards.pop() ?? null
    this.curBlackCard = newBlackCard
      ? {
        id: newBlackCard.id,
        pick: newBlackCard.pick ?? 1,
        draw: newBlackCard.draw ?? 0
      }
      : null
  }

  chooseNewTsar() {
    if (this.tsar) {
      const curTsarIdx = this.players.indexOf(this.tsar)
      this.tsar = this.players[(curTsarIdx + 1) % this.players.length]
    } else {
      this.tsar = this.players[0]
    }
  }

  addPlayer(metadata?: PM): Player<PM> | null {
    const player = new Player({ game: this, metadata })

    if (this.state !== GameState.NOT_STARTED) {
      let neededCards = this.maxCards
      if (this.state === GameState.CHOOSING)
        neededCards += this.curBlackCard?.draw ?? 0

      if (this.whiteCards.length < neededCards) return null

      player.cards = this.whiteCards.splice(0, neededCards)
    }

    this.players.push(player)

    return player
  }

  removePlayer(player: Player) {
    if (player.isTsar) {
      // give back white cards
      for (const player of this.players) {
        if (!player.chose) continue

        player.cards = player.cards.concat(player.choice)
        player.choice = []
      }

      this.chooseNewTsar()

      if (this.state === GameState.TSAR_VERDICT) {
        this.blackCards.push(this.curBlackCard as CurBlackCard)
        this.blackCards = shuffle(this.blackCards)
        this.newBlackCard()
        this.state = GameState.CHOOSING
      }
    }

    this.players = this.players.filter(p => p !== player)
  }

  start() {
    if (this.state !== GameState.NOT_STARTED)
      throw new Error("The game has already started")
    if (this.players.length < 2) throw new Error("Not enough players")

    this.whiteCards = shuffle(this.whiteCards)
    this.blackCards = shuffle(this.blackCards)
    this.players = shuffle(this.players)

    if (!this.newRound()) throw new Error("Not enough cards")
  }

  // TODO: make sure to deal evenly
  dealCards() {
    const additionalCards = this.curBlackCard?.draw ?? 0

    for (const player of this.players) {
      let target = this.maxCards
      if (!player.isTsar) target += additionalCards

      while (player.cards.length + player.choice.length < target) {
        const newCard = this.whiteCards.pop()
        if (!newCard) return
        player.cards.push(newCard)
      }
    }
  }

  /**
   * @returns boolean that indicates whether the game can continue
   */
  newRound() {
    if (!this.enoughCards()) return false

    this.state = GameState.CHOOSING

    this.players.forEach(p => (p.choice = []))

    this.chooseNewTsar()
    this.newBlackCard()
    this.dealCards()

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
        metadata: p.metadata,
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
