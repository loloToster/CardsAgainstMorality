import { defineStore } from "pinia"
import type { LoggedInUser, User } from "@/types/user"

export interface UserStore {
  value: LoggedInUser
  fetching: boolean
  everLoggedIn: boolean
}

const EVER_LOGGED_IN = "ever-logged-in"

export const useUserStore = defineStore("user", {
  state: (): UserStore => ({
    value: null,
    fetching: true,
    everLoggedIn: Boolean(window.localStorage.getItem(EVER_LOGGED_IN))
  }),
  actions: {
    login(user: User) {
      window.localStorage.setItem(EVER_LOGGED_IN, "true")
      this.value = user
      this.fetching = false
      this.everLoggedIn = true
    }
  }
})
