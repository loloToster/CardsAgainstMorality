import { reactive } from "vue"

import NewRoundAudio from "../assets/new-round.mp3"
import TsarChoiceAudio from "../assets/tsar-choice.mp3"
import CameraAudio from "../assets/camera.mp3"

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

export const audioState = reactive({
  on: window.localStorage.getItem(AUDIO_STORAGE_KEY) === AudioState.ON
})

export function playAudio(name: keyof typeof audios) {
  if (!audioState.on) return
  return new Audio(audios[name]).play()
}

export function toggleAudio(force?: boolean) {
  audioState.on = force === undefined ? !audioState.on : force

  window.localStorage.setItem(
    "audio",
    audioState.on ? AudioState.ON : AudioState.OFF
  )
}
