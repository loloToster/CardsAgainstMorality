import { ApiBlackCard, ApiWhiteCard, PodiumEl } from "@backend/types"

export enum GameStage {
  UNKNOWN,
  NOT_STARTED,
  CHOOSING,
  TSAR_VERDICT
}

export interface GameState {
  stage: GameStage
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
