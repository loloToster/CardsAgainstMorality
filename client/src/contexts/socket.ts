import { reactive } from "vue"
import { io } from "socket.io-client"

export const socketState = reactive({
  connected: false
})

const URL = "http://localhost:3000"

let auth = {}
export function setAuth(a: object) {
  auth = a
}

export const socket = io(URL, {
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
