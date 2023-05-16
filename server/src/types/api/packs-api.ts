import { ApiWhiteCard } from "./game-api"

interface IdWithName {
  id: number
  name: string
}

export interface ApiCardPack {
  id: number
  name: string
  type: string
  bundle?: string | null
  color?: string | null
  icon?: string | null
  tags: string[]
  numOfBlacks: number
  numOfWhites: number
  likedBy: number
  liked?: boolean
}

export type ApiCardPackType = IdWithName
export type ApiCardPackBundle = IdWithName
export type ApiCardPackTag = IdWithName

export interface SearchCriteria {
  types: ApiCardPackType[]
  bundles: ApiCardPackBundle[]
  tags: ApiCardPackTag[]
}

export interface ApiRandomCard extends ApiWhiteCard {
  color: "white" | "black"
}
