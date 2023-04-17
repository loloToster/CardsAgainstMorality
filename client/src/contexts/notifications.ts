import { reactive } from "vue"
import { findFreeId } from "../utils"

export type NotificationType = "info" | "success" | "warn" | "error"

export interface Notification {
  id: number
  type: NotificationType
  text: string
}

export const notifications = reactive<{ active: Notification[] }>({
  active: []
})

export function notify(notification: Omit<Notification, "id">) {
  const id = findFreeId(notifications.active.map(n => n.id))
  notifications.active.push({ id, ...notification })
}

export function removeNotification(id: number) {
  notifications.active = notifications.active.filter(n => n.id !== id)
}
