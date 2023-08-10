import { defineStore } from "pinia"
import type { LoggedInUser } from "@/types/user"

export interface UserStore {
  value: LoggedInUser
  fetching: boolean
}

export const useUserStore = defineStore("user", {
  state: (): UserStore => ({
    value: null,
    fetching: true
  })
})
