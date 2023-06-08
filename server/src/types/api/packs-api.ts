import { ApiWhiteCard } from "./game-api"

interface IdWithName {
  id: number
  name: string
}

export type ApiCardPackType = IdWithName
export type ApiCardPackBundle = IdWithName
export type ApiCardPackTag = IdWithName

export interface ApiCardPack {
  id: string
  name: string
  official: boolean
  type: ApiCardPackType
  bundle?: ApiCardPackBundle | null
  color?: string | null
  icon?: string | null
  tags: ApiCardPackTag[]
  numOfBlacks: number
  numOfWhites: number
  likedBy: number
  liked?: boolean
  owner?: {
    id: number
    name: string
  }
}

export interface SearchCriteria {
  types: ApiCardPackType[]
  bundles: ApiCardPackBundle[]
  tags: ApiCardPackTag[]
}

export type SortType = "likes" | "cards" | "blacks" | "whites"

export interface ApiRandomCard extends ApiWhiteCard {
  color: "white" | "black"
}
