import { reactive } from "vue"
import type { LoggedInUser } from "@/types/user"

export const user = reactive<{
  value: LoggedInUser
  fetching: boolean
}>({
  value: null,
  fetching: true
})
