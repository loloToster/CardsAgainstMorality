export * from "./api"
export * from "./sockets"

export interface SettingsBoundary {
  min?: number
  max?: number
  default: number
}

export interface SettingsBoundaries {
  playersLimit: SettingsBoundary
  timeLimit: SettingsBoundary
  scoreLimit: SettingsBoundary
  roundLimit: SettingsBoundary
}
