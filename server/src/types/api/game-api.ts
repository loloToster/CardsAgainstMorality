export interface ApiPlayer {
  name: string
  picture: string
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
