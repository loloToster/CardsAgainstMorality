export interface User {
  id: number
  name: string
  picture: string
}

export type LoggedInUser = null | User
