import { reactive } from "vue"
import type {
  ApiCardPack,
  SettingsBoundary,
  SettingsBoundaryName,
  SettingsData
} from "@backend/types"
import { SETTINGS_BOUNDARIES } from "@backend/consts"

interface SettingsPack extends ApiCardPack {
  selected: boolean
}

export const gameSettingsState = reactive<{
  roomName: string
  playersLimit: number
  timeLimitEnabled: boolean
  timeLimit: number
  scoreLimitEnabled: boolean
  scoreLimit: number
  roundLimitEnabled: boolean
  roundLimit: number
  packs: SettingsPack[]
}>({
  roomName: "",
  playersLimit: SETTINGS_BOUNDARIES.playersLimit.default,
  timeLimitEnabled: false,
  timeLimit: SETTINGS_BOUNDARIES.timeLimit.default,
  scoreLimitEnabled: false,
  scoreLimit: SETTINGS_BOUNDARIES.scoreLimit.default,
  roundLimitEnabled: false,
  roundLimit: SETTINGS_BOUNDARIES.roundLimit.default,
  packs: []
})

export function ensureBoundary(curVal: number, boundary: SettingsBoundary) {
  return (
    !isNaN(curVal) &&
    !(curVal % 1) &&
    (boundary.min === undefined || curVal >= boundary.min) &&
    (boundary.max === undefined || curVal <= boundary.max)
  )
}

export function setByParsedSettings(data: SettingsData) {
  gameSettingsState.playersLimit = data.playersLimit

  gameSettingsState.timeLimitEnabled = data.timeLimit !== null
  gameSettingsState.scoreLimitEnabled = data.scoreLimit !== null
  gameSettingsState.roundLimitEnabled = data.roundLimit !== null

  if (data.timeLimit !== null) gameSettingsState.timeLimit = data.timeLimit
  if (data.scoreLimit !== null) gameSettingsState.scoreLimit = data.scoreLimit
  if (data.roundLimit !== null) gameSettingsState.roundLimit = data.roundLimit

  gameSettingsState.packs.forEach(p => (p.selected = data.packs.includes(p.id)))
}

export function getParsedSettings(): SettingsData {
  return {
    playersLimit: gameSettingsState.playersLimit,
    timeLimit: gameSettingsState.timeLimitEnabled
      ? gameSettingsState.timeLimit
      : null,
    scoreLimit: gameSettingsState.scoreLimitEnabled
      ? gameSettingsState.scoreLimit
      : null,
    roundLimit: gameSettingsState.roundLimitEnabled
      ? gameSettingsState.roundLimit
      : null,
    packs: gameSettingsState.packs.filter(p => p.selected).map(p => p.id)
  }
}

export function getValidParsedSettings(): Partial<SettingsData> {
  const curSettings = getParsedSettings()

  const validSettings: Partial<SettingsData> = {}

  // check required
  validSettings.packs = curSettings.packs

  if (
    ensureBoundary(curSettings.playersLimit, SETTINGS_BOUNDARIES.playersLimit)
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
