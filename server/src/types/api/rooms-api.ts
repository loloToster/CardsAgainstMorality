export interface ApiRoom {
  id: string
  name: string
  started: boolean
  leaderAvatar: string | null | undefined
  leaderName: string
  // players without leader
  players: string[]
  maxPlayers: number
  packs: string[]
  rejoin: boolean
}
