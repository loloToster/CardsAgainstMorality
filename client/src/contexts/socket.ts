import { reactive } from "vue"
import { io, Socket } from "socket.io-client"
import {
  ClientToServerSocketEvents,
  ServerToClientSocketEvents
} from "@backend/types"

export const socketState = reactive({
  connected: false
})

let auth = {}
export function setAuth(a: object) {
  auth = a
}

export const socket: Socket<
  ServerToClientSocketEvents,
  ClientToServerSocketEvents
> = io({
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
