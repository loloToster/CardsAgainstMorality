import { ApiWhiteCard } from "./game-api"

export * from "./game-api"
export * from "./user-api"

export interface ApiCardPack {
  id: number
  name: string
  color?: string
  icon?: string
}

export interface ApiRandomCard extends ApiWhiteCard {
  color: "white" | "black"
}
