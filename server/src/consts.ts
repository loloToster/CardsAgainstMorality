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

export const VOTING_TIME = 2 * 60 * 1000
