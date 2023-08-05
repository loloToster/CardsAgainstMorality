import { ApiWhiteCard } from "./game-api"
import { ApiUser } from "./user-api"
import { CARD_COLORS } from "../../consts"

interface IdWithName {
  id: number
  name: string
}

export type ApiCardPackType = IdWithName
export type ApiCardPackBundle = IdWithName
export type ApiCardPackTag = IdWithName

export interface ApiCardPackEditableDetailsBase {
  name: string
  private: boolean
  color?: string | null
  icon?: string | null
}

export interface ApiCardPackEditableDetails
  extends ApiCardPackEditableDetailsBase {
  type: number
  tags: number[]
}

export interface ApiCardPackRichEditableDetails
  extends ApiCardPackEditableDetailsBase {
  type: ApiCardPackType
  tags: ApiCardPackTag[]
}

export interface ApiCardPack extends ApiCardPackRichEditableDetails {
  id: string
  official: boolean
  bundle?: ApiCardPackBundle | null
  numOfBlacks: number
  numOfWhites: number
  likedBy: number
  liked?: boolean
  owner?: ApiUser
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
