import axios from "axios"
import { useUserStore } from "@/contexts/user"

const api = axios.create()

api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      const user = useUserStore()
      user.value = null
    }

    return Promise.reject(err)
  }
)

export default api
