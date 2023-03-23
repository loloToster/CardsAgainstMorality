import { reactive } from "vue"
import { io } from "socket.io-client"

export const socketState = reactive({
  connected: false
})

let auth = {}
export function setAuth(a: object) {
  auth = a
}

export const socket = io({
  autoConnect: false,
  auth: cb => {
    cb(auth)
  }
})

socket.on("connect", () => {
  socketState.connected = true
})

socket.on("disconnect", () => {
  socketState.connected = false
})
