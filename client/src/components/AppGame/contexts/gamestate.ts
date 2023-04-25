import { reactive } from "vue"
import { deepclone } from "@/utils"
import { GameStage, GameState, PlayerState } from "@/types/game"

const defaultPlayerState: PlayerState = {
  imTsar: false,
  cards: new Array(10).fill(null).map((_, i) => ({
    id: i,
    text: i.toString(),
    pack: "testpack"
  })),
  submitted: false,
  pickedCards: [],
  choices: [],
  activeChoiceIdx: null
}

const defaultGameState: GameState = {
  stage: GameStage.UNKNOWN,
  players: [],
  voting: null,
  timeLimit: null,
  blackCard: { id: -1, text: "test", pack: "test pack", pick: 1 },
  roundWinnerData: null,
  podium: null,
  ...defaultPlayerState
}

export const gameState = reactive<GameState>(deepclone(defaultGameState))

export function resetPlayerState() {
  Object.assign(gameState, deepclone(defaultPlayerState))
}

export function resetGameState() {
  Object.assign(gameState, deepclone(defaultGameState))
}
