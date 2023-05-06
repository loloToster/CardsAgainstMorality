import { ApiWhiteCard } from "./game-api"

export * from "./game-api"
export * from "./user-api"

export interface ApiCardPack {
  id: number
  name: string
  type: string
  bundle?: string | null
  color?: string | null
  icon?: string | null
  numOfBlacks: number
  numOfWhites: number
  likedBy: number
  liked?: boolean
}

export interface ApiRandomCard extends ApiWhiteCard {
  color: "white" | "black"
}
