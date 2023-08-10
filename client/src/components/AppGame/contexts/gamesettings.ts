import { acceptHMRUpdate, defineStore } from "pinia"
import type {
  SettingsBoundary,
  SettingsBoundaryName,
  SettingsPack,
  SettingsData
} from "@backend/types"
import { SETTINGS_BOUNDARIES } from "@backend/consts"

export function ensureBoundary(curVal: number, boundary: SettingsBoundary) {
  return (
    !isNaN(curVal) &&
    !(curVal % 1) &&
    (boundary.min === undefined || curVal >= boundary.min) &&
    (boundary.max === undefined || curVal <= boundary.max)
  )
}

export interface GameSettingsStore {
  roomName: string
  public: boolean
  playersLimit: number
  timeLimitEnabled: boolean
  timeLimit: number
  scoreLimitEnabled: boolean
  scoreLimit: number
  roundLimitEnabled: boolean
  roundLimit: number
  selectedPacks: SettingsPack[] // this should never contain both false
}

export const useGameSettingsStore = defineStore("game-settings", {
  state: (): GameSettingsStore => ({
    roomName: SETTINGS_BOUNDARIES.name.default,
    public: SETTINGS_BOUNDARIES.public.default,
    playersLimit: SETTINGS_BOUNDARIES.playersLimit.default,
    timeLimitEnabled: false,
    timeLimit: SETTINGS_BOUNDARIES.timeLimit.default,
    scoreLimitEnabled: false,
    scoreLimit: SETTINGS_BOUNDARIES.scoreLimit.default,
    roundLimitEnabled: false,
    roundLimit: SETTINGS_BOUNDARIES.roundLimit.default,
    selectedPacks: []
  }),
  actions: {
    setByParsedSettings(data: SettingsData) {
      this.roomName = data.name
      this.public = data.public

      this.playersLimit = data.playersLimit

      this.timeLimitEnabled = data.timeLimit !== null
      this.scoreLimitEnabled = data.scoreLimit !== null
      this.roundLimitEnabled = data.roundLimit !== null

      if (data.timeLimit !== null) this.timeLimit = data.timeLimit
      if (data.scoreLimit !== null) this.scoreLimit = data.scoreLimit
      if (data.roundLimit !== null) this.roundLimit = data.roundLimit

      this.selectedPacks = data.packs.filter(p => p.blacks || p.whites)
    },
    getParsedSettings(): SettingsData {
      return {
        name: this.roomName,
        public: this.public,
        playersLimit: this.playersLimit,
        timeLimit: this.timeLimitEnabled ? this.timeLimit : null,
        scoreLimit: this.scoreLimitEnabled ? this.scoreLimit : null,
        roundLimit: this.roundLimitEnabled ? this.roundLimit : null,
        packs: this.selectedPacks.filter(p => p.blacks || p.whites)
      }
    },
    getValidParsedSettings(): Partial<SettingsData> {
      const curSettings = this.getParsedSettings()

      const validSettings: Partial<SettingsData> = {}

      // check required
      if (SETTINGS_BOUNDARIES.name.matches.test(curSettings.name))
        validSettings.name = curSettings.name

      validSettings.public = curSettings.public
      validSettings.packs = curSettings.packs

      if (
        ensureBoundary(
          curSettings.playersLimit,
          SETTINGS_BOUNDARIES.playersLimit
        )
      )
        validSettings.playersLimit = curSettings.playersLimit

      // check not required
      const notRequired = [
        "timeLimit",
        "scoreLimit",
        "roundLimit"
      ] as const satisfies Readonly<SettingsBoundaryName[]>

      notRequired.forEach(k => {
        const curSetting = curSettings[k]

        if (
          curSetting === null ||
          ensureBoundary(curSetting, SETTINGS_BOUNDARIES[k])
        )
          validSettings[k] = curSetting
      })

      return validSettings
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameSettingsStore, import.meta.hot))
}
