import { acceptHMRUpdate, defineStore } from "pinia"
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

export const useGameStateStore = defineStore("game-state", {
  state: (): GameState => ({
    stage: GameStage.UNKNOWN,
    players: [],
    voting: null,
    timeLimit: null,
    blackCard: { id: -1, text: "test", pack: "test pack", pick: 1, draw: 0 },
    roundWinnerData: null,
    podium: null,
    ...defaultPlayerState
  }),
  actions: {
    resetPlayerState() {
      return this.$patch(deepclone(defaultPlayerState))
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStateStore, import.meta.hot))
}
