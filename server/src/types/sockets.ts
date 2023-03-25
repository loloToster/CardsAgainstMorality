import { ApiBlackCard, ApiPlayer, ApiWhiteCard } from "./api"

export interface NewRoundData {
  tsar: boolean
  blackCard: ApiBlackCard
  cards: ApiWhiteCard[]
}

export interface PrevRound {
  winner: string
  blackCard: ApiBlackCard
  winningCards: ApiWhiteCard[]
  imWinner: boolean
}

export interface ServerToClientSocketEvents {
  players: (data: { players: ApiPlayer[] }) => void
  "new-round": (data: NewRoundData & { prevRound?: PrevRound }) => void
  choices: (data: { choices: ApiWhiteCard[][] }) => void
  rejoin: (data: NewRoundData & { choices?: ApiWhiteCard[][] }) => void
}

export interface ClientToServerSocketEvents {
  start: (data: { packs: number[] }) => void
  submit: (data: { submition: number[] }) => void
  verdict: (data: { verdict: number[] }) => void
}
