export interface ApiPlayer {
  userId: number
  name: string
  picture: string
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
  pick: number
}
