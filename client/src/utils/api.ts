import axios from "axios"
import { user } from "@/contexts/user"

const api = axios.create()

api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      user.value = null
    }

    return Promise.reject(err)
  }
)

export default api
