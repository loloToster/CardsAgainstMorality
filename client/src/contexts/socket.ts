import { defineStore } from "pinia"
import { io, Socket } from "socket.io-client"

import type {
  ClientToServerSocketEvents,
  ServerToClientSocketEvents
} from "@backend/types"

export const useSocketStore = defineStore("socket", {
  state: () => {
    const socket: Socket<
      ServerToClientSocketEvents,
      ClientToServerSocketEvents
    > = io({
      autoConnect: false,
      auth: {}
    })

    return {
      initialized: false,
      connected: false,
      socket
    }
  },
  actions: {
    init() {
      if (this.initialized) return

      this.initialized = true

      this.socket.on("connect", () => {
        this.connected = true
      })

      this.socket.on("disconnect", () => {
        this.connected = false
      })
    },
    setAuth(a: object) {
      this.socket.auth = a
    }
  }
})
