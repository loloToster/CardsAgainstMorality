export interface Player {
  img: string
  name: string
  points: number
}

export interface WhiteCard {
  id: number
  text: string
  pack: string
}

export interface BlackCard extends WhiteCard {
  draw?: number
  pick?: number
}
