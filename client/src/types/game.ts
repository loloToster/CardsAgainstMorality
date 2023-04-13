import {
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

export interface GameState {
  audio: boolean
  stage: GameStage
  players: ApiPlayer[]
  voting: VotingData | null
  timeLimit: number | null
  imTsar: boolean
  blackCard: ApiBlackCard
  cards: ApiWhiteCard[]
  pickedCards: ApiWhiteCard[]
  submitted: boolean
  choices: ApiWhiteCard[][]
  activeChoiceIdx: number | null
  roundWinnerData: {
    winner: string
    blackCard: ApiBlackCard
    winningCards: ApiWhiteCard[]
    imWinner: boolean
  } | null
  podium: PodiumEl[] | null
}
