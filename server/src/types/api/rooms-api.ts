// TODO: add more data about the game: all players, cards, stage, etc.
// TODO: add info when user is rejoining
export interface ApiRoom {
  id: string
  name: string
  leaderAvatar: string | null | undefined
  leaderName: string
  players: number
  maxPlayers: number
}
