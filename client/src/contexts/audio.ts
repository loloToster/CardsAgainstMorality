import { defineStore } from "pinia"

import NewRoundAudio from "@/assets/new-round.mp3"
import TsarChoiceAudio from "@/assets/tsar-choice.mp3"
import CameraAudio from "@/assets/camera.mp3"

const audios = {
  "new-round": NewRoundAudio,
  "tsar-choice": TsarChoiceAudio,
  camera: CameraAudio
}

const AUDIO_STORAGE_KEY = "audio"

enum AudioState {
  ON = "on",
  OFF = "off"
}

export const useAudioStore = defineStore("audio", {
  state: () => ({
    on: window.localStorage.getItem(AUDIO_STORAGE_KEY) === AudioState.ON
  }),
  actions: {
    play(name: keyof typeof audios) {
      if (!this.on) return
      return new Audio(audios[name]).play()
    },
    toggle(force?: boolean) {
      this.on = force === undefined ? !this.on : force

      window.localStorage.setItem(
        "audio",
        this.on ? AudioState.ON : AudioState.OFF
      )
    }
  }
})
