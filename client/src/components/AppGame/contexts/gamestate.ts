import { reactive } from "vue"
import { deepclone } from "../../../utils"
import { GameStage, GameState, PlayerState } from "../../../types/game"

enum AudioState {
  ON = "on",
  OFF = "off"
}

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
  audio: false,
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

function syncAudio() {
  gameState.audio = window.localStorage.getItem("audio") === AudioState.ON
}

syncAudio()

export function resetPlayerState() {
  Object.assign(gameState, deepclone(defaultPlayerState))
}

export function resetGameState() {
  Object.assign(gameState, deepclone(defaultGameState))
  syncAudio()
}

export function toggleAudio() {
  gameState.audio = !gameState.audio
  window.localStorage.setItem(
    "audio",
    gameState.audio ? AudioState.ON : AudioState.OFF
  )
}
