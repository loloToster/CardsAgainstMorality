import { reactive } from "vue"
import { LoggedInUser } from "../types/user"

export const user = reactive<{ value: LoggedInUser }>({ value: null })
