export * from "./api"
export * from "./sockets"

export interface SettingsBoundary {
  min: number
  max: number
  default: number
}

export interface SettingsBoundaries {
  name: { matches: RegExp; default: string }
  public: { default: boolean }
  playersLimit: SettingsBoundary
  timeLimit: SettingsBoundary
  scoreLimit: SettingsBoundary
  roundLimit: SettingsBoundary
}

export type SettingsBoundaryName = keyof SettingsBoundaries
