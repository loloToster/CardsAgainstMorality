export enum GameStage {
  NOT_STARTED,
  CHOOSING,
  TSAR_VERDICT
}

export interface Player {
  name: string
  picture: string
  connected: boolean
  tsar: boolean
  ready: boolean
  points: number
}

export interface CardPack {
  id: number
  name: string
}

export interface WhiteCard {
  id: number
  text: string
  pack: string
}

export interface BlackCard extends WhiteCard {
  draw?: number
  pick: number
}
