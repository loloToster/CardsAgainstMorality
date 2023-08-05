import { ApiUser } from "./user-api"

export interface ApiRoom {
  id: string
  name: string
  started: boolean
  leader: ApiUser
  // players without leader
  players: string[]
  maxPlayers: number
  packs: string[]
  rejoin: boolean
}
