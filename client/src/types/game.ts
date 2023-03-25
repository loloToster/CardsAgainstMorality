import { ApiBlackCard, ApiWhiteCard } from "@backend/types"

export enum GameStage {
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
  winnerData: {
    winner: string
    blackCard: ApiBlackCard
    winningCards: ApiWhiteCard[]
    imWinner: boolean
  } | null
}
