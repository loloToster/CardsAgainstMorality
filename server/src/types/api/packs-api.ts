import { ApiWhiteCard } from "./game-api"
import { CARD_COLORS } from "../../consts"

interface IdWithName {
  id: number
  name: string
}

export type ApiCardPackType = IdWithName
export type ApiCardPackBundle = IdWithName
export type ApiCardPackTag = IdWithName

export interface ApiCardPackEditableDetails {
  name: string
  color?: string | null
  icon?: string | null
}

export interface ApiCardPack extends ApiCardPackEditableDetails {
  id: string
  official: boolean
  type: ApiCardPackType
  bundle?: ApiCardPackBundle | null
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

export type CardColor = (typeof CARD_COLORS)[number]

export interface ApiRandomCard extends ApiWhiteCard {
  color: CardColor
}
