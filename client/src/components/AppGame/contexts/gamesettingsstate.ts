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

export function ensureBoundary(curVal: number, boundary: SettingsBoundary) {
  return (
    !isNaN(curVal) &&
    !(curVal % 1) &&
    (boundary.min === undefined || curVal >= boundary.min) &&
    (boundary.max === undefined || curVal <= boundary.max)
  )
}

export function setSettingBoundaries(settingsBoundaries: SettingsBoundaries) {
  gameSettingsState.settingsBoundaries = settingsBoundaries

  if (
    !ensureBoundary(
      gameSettingsState.playersLimit,
      settingsBoundaries.playersLimit
    )
  )
    gameSettingsState.playersLimit = settingsBoundaries.playersLimit.default

  if (
    !ensureBoundary(gameSettingsState.timeLimit, settingsBoundaries.timeLimit)
  )
    gameSettingsState.timeLimit = settingsBoundaries.timeLimit.default

  if (
    !ensureBoundary(gameSettingsState.scoreLimit, settingsBoundaries.scoreLimit)
  )
    gameSettingsState.scoreLimit = settingsBoundaries.scoreLimit.default

  if (
    !ensureBoundary(gameSettingsState.roundLimit, settingsBoundaries.roundLimit)
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

export function getValidParsedSettings(): Partial<SettingsData> {
  const curSettings = getParsedSettings()

  if (!gameSettingsState.settingsBoundaries) return curSettings

  const validSettings: Partial<SettingsData> = {}

  if (
    ensureBoundary(
      curSettings.playersLimit,
      gameSettingsState.settingsBoundaries.playersLimit
    )
  )
    validSettings.playersLimit = curSettings.playersLimit

  if (
    curSettings.timeLimit === null ||
    ensureBoundary(
      curSettings.timeLimit,
      gameSettingsState.settingsBoundaries.timeLimit
    )
  )
    validSettings.timeLimit = curSettings.timeLimit

  if (
    curSettings.scoreLimit === null ||
    ensureBoundary(
      curSettings.scoreLimit,
      gameSettingsState.settingsBoundaries.scoreLimit
    )
  )
    validSettings.scoreLimit = curSettings.scoreLimit

  if (
    curSettings.roundLimit === null ||
    ensureBoundary(
      curSettings.roundLimit,
      gameSettingsState.settingsBoundaries.roundLimit
    )
  )
    validSettings.roundLimit = curSettings.roundLimit

  validSettings.packs = curSettings.packs

  return validSettings
}
