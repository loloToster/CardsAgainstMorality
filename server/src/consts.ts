import type { SettingsBoundaries } from "./types"

export const PROD = process.env.NODE_ENV === "production"
export const SYNC_CARDS_ARGV = "-c"

export const CARD_COLORS = ["black", "white"] as const

export const ICONS_URL = "https://cdn.jsdelivr.net/npm/@mdi/svg/meta.json"

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

export const MAX_PACK_NAME_LEN = 32
export const MAX_PACK_TAGS = 6

export const MIN_PICK = 1
export const MAX_PICK = 3
export const MIN_DRAW = 0
export const MAX_DRAW = 2

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
