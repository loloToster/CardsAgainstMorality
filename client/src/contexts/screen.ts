import { defineStore } from "pinia"

// keep in sync with @/styles/mixins
const SIZES = {
  xxs: 600,
  xs: 768,
  sm: 992,
  md: 1200,
  lg: 1600
}

interface ScreenState {
  size: number
}

type ScreenStoreGetter = (state: ScreenState) => boolean

const getters: Record<string, ScreenStoreGetter> = {}

Object.entries(SIZES).forEach(([name, size]) => {
  getters[name] = state => state.size <= size
})

export const useScreenStore = defineStore("screen", {
  state: () => ({
    size: Infinity
  }),
  getters: getters as Record<keyof typeof SIZES, ScreenStoreGetter>
})
