import { reactive } from "vue"
import { GameStage, GameState } from "../../../types/game"

enum AudioState {
  ON = "on",
  OFF = "off"
}

const defaultGameState: GameState = {
  audio: window.localStorage.getItem("audio") === AudioState.ON,
  stage: GameStage.UNKNOWN,
  players: [],
  voting: null,
  imTsar: false,
  blackCard: { id: -1, text: "test", pack: "test pack", pick: 1 },
  cards: new Array(10).fill(null).map((_, i) => ({
    id: i,
    text: i.toString(),
    pack: "testpack"
  })),
  pickedCards: [],
  submitted: false,
  choices: [],
  activeChoiceIdx: null,
  roundWinnerData: null,
  podium: null
}

export const gameState = reactive<GameState>({ ...defaultGameState })

export function resetGameState() {
  Object.assign(gameState, defaultGameState)
}

export function toggleAudio() {
  gameState.audio = !gameState.audio
  window.localStorage.setItem(
    "audio",
    gameState.audio ? AudioState.ON : AudioState.OFF
  )
}
