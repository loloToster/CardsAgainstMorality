import { defineStore } from "pinia"
import { findFreeId } from "../utils"

export type NotificationType = "info" | "success" | "warn" | "error"

export interface Notification {
  id: number
  type: NotificationType
  text: string
}

export interface NotificationsStore {
  active: Notification[]
}

export const useNotificationsStore = defineStore("notifications", {
  state: (): NotificationsStore => ({
    active: []
  }),
  actions: {
    add(notification: Omit<Notification, "id">) {
      const id = findFreeId(this.active.map(n => n.id))
      this.active.push({ id, ...notification })
    },
    remove(id: number) {
      this.active = this.active.filter(n => n.id !== id)
    }
  }
})
