import type { IncomingMessage } from "http"
import type { Server, Socket } from "socket.io"
import type { ApiBlackCard, ApiPlayer, ApiWhiteCard } from "./api"

export interface NewRoundData {
  tsar: boolean
  blackCard: ApiBlackCard
  cards: ApiWhiteCard[]
  timeLimit: number | null
}

export interface PrevRound {
  winner: string
  blackCard: ApiBlackCard
  winningCards: ApiWhiteCard[]
  imWinner: boolean
  randomlyPicked: boolean
}

export interface PodiumEl {
  place: number
  name: string
  picture: string
  points: number
}

export const VOTE_TYPES = ["end", "kick"] as const

export type VoteType = (typeof VOTE_TYPES)[number]

export type VotingMeta =
  | {
      type: (typeof VOTE_TYPES)[0]
    }
  | {
      type: (typeof VOTE_TYPES)[1]
      playerId: number
    }

export interface VotingData {
  endsInMs: number
  by: string
  voting: VotingMeta
  for: number
  against: number
  vote: null | boolean
}

export interface ChoicesData {
  choices: ApiWhiteCard[][]
  pickedCards?: number[]
  timeLimit: number | null
}

export type SyncData =
  | { started: false }
  | (NewRoundData & {
      started: true
      choices?: ApiWhiteCard[][]
      voting: VotingData | null
    })

export interface ServerToClientSocketEvents {
  players: (data: { players: ApiPlayer[] }) => void
  "new-round": (data: NewRoundData & { prevRound?: PrevRound }) => void
  choices: (data: ChoicesData) => void
  sync: (data: SyncData) => void
  end: (data: { podium: PodiumEl[] }) => void
  voting: (data: VotingData | null) => void
}

export interface StartData {
  playersLimit: number
  timeLimit: number | null
  scoreLimit: number | null
  roundLimit: number | null
  packs: number[]
}

export interface Submition {
  submition: number[]
}

export interface Verdict {
  verdict: number[]
}

export interface Vote {
  vote: boolean
}

export interface ClientToServerSocketEvents {
  start: (data: StartData) => void
  submit: (data: Submition) => void
  verdict: (data: Verdict) => void
  "vote-start": (data: VotingMeta) => void
  vote: (data: Vote) => void
}

export type SocketServer = Server<
  ClientToServerSocketEvents,
  ServerToClientSocketEvents
>

export type SocketClient = Socket<
  ClientToServerSocketEvents,
  ServerToClientSocketEvents
>

export interface ExtendedReq extends IncomingMessage {
  session?: { passport?: { user?: number } }
}
