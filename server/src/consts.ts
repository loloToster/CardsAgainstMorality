import type { SettingsBoundaries } from "./types"

// minimum amount of miliseconds between inactive anonymous users removal
export const MIN_TIME_BETWEEN_ANS_USER_RM = 20 * 60 * 1000
// after how many miliseconds is user considered inactive
export const INACTIVITY_TIME = 2 * 60 * 60 * 1000

export enum StrategyIdentifier {
  Anonymous = "ans",
  Google = "ggl",
  Discord = "dsc",
  Facebook = "fcb"
}

export const TIME_LIMIT_OFFSET = 500

export const SETTINGS_BOUNDARIES: SettingsBoundaries = {
  name: {
    default: "",
    matches: /^[a-zA-z0-9 ]{0,32}$/
  },
  public: {
    default: false
  },
  playersLimit: {
    min: 2,
    max: 20,
    default: 10
  },
  timeLimit: {
    min: 5,
    max: 360,
    default: 120
  },
  scoreLimit: {
    min: 1,
    max: Infinity,
    default: 15
  },
  roundLimit: {
    min: 1,
    max: Infinity,
    default: 30
  }
}

export const VOTING_TIME = 2 * 60 * 1000
