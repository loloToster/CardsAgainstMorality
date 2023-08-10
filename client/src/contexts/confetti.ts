import { defineStore } from "pinia"
import JSConfetti from "js-confetti"

export const useConfettiStore = defineStore("confetti", {
  state: () => ({
    confetti: new JSConfetti()
  }),
  actions: {
    addConfetti() {
      return this.confetti.addConfetti()
    }
  }
})
