import { ApiUser } from "./user-api"

export interface ApiPlayer {
  user: ApiUser
  leader: boolean
  connected: boolean
  tsar: boolean
  ready: boolean
  points: number
}

export interface ApiWhiteCard {
  id: number
  text: string
  pack: string
}

export interface ApiBlackCard extends ApiWhiteCard {
  pick: number | null
  draw: number | null
}
