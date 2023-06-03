// TODO: add more data about the game: card packs
export interface ApiRoom {
  id: string
  name: string
  started: boolean
  leaderAvatar: string | null | undefined
  leaderName: string
  players: string[]
  maxPlayers: number
  rejoin: boolean
}
