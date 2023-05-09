import { reactive } from "vue"
import {
  ApiCardPack,
  SettingsBoundaries,
  SettingsBoundary,
  SettingsData
} from "@backend/types"

interface SettingsPack extends ApiCardPack {
  selected: boolean
}

export const gameSettingsState = reactive<{
  settingsBoundaries: SettingsBoundaries | null
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
  settingsBoundaries: null,
  roomName: "",
  playersLimit: NaN,
  timeLimitEnabled: false,
  timeLimit: NaN,
  scoreLimitEnabled: false,
  scoreLimit: NaN,
  roundLimitEnabled: false,
  roundLimit: NaN,
  packs: []
})

function checkBoundary(curVal: number, boundary: SettingsBoundary) {
  return (
    isNaN(curVal) ||
    (boundary.min && curVal < boundary.min) ||
    (boundary.max && curVal > boundary.max)
  )
}

export function setSettingBoundaries(settingsBoundaries: SettingsBoundaries) {
  gameSettingsState.settingsBoundaries = settingsBoundaries

  if (
    checkBoundary(
      gameSettingsState.playersLimit,
      settingsBoundaries.playersLimit
    )
  )
    gameSettingsState.playersLimit = settingsBoundaries.playersLimit.default

  if (checkBoundary(gameSettingsState.timeLimit, settingsBoundaries.timeLimit))
    gameSettingsState.timeLimit = settingsBoundaries.timeLimit.default

  if (
    checkBoundary(gameSettingsState.scoreLimit, settingsBoundaries.scoreLimit)
  )
    gameSettingsState.scoreLimit = settingsBoundaries.scoreLimit.default

  if (
    checkBoundary(gameSettingsState.roundLimit, settingsBoundaries.roundLimit)
  )
    gameSettingsState.roundLimit = settingsBoundaries.roundLimit.default
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
