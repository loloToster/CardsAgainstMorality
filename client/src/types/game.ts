import type {
  ApiBlackCard,
  ApiPlayer,
  ApiWhiteCard,
  PodiumEl,
  VotingData
} from "@backend/types"

export enum GameStage {
  UNKNOWN,
  NOT_STARTED,
  CHOOSING,
  TSAR_VERDICT
}

export interface PlayerState {
  imTsar: boolean
  cards: ApiWhiteCard[]
  submitted: boolean
  pickedCards: ApiWhiteCard[]
  choices: ApiWhiteCard[][]
  activeChoiceIdx: number | null
}

export interface GameState extends PlayerState {
  stage: GameStage
  players: ApiPlayer[]
  voting: VotingData | null
  timeLimit: number | null
  blackCard: ApiBlackCard
  roundWinnerData: {
    winner: string
    blackCard: ApiBlackCard
    winningCards: ApiWhiteCard[]
    imWinner: boolean
  } | null
  podium: PodiumEl[] | null
}
