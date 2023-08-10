<script setup lang="ts">
import { useNotificationsStore } from "@/contexts/notifications"
import AppNotification from "./AppNotification.vue"

const notifications = useNotificationsStore()
</script>

<template>
  <div class="notifications">
    <AppNotification
      v-for="notification in notifications.active"
      :notification="notification"
      class="notifications__notification"
      :key="notification.id"
    />
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;

$spacing: 6px;

.notifications {
  position: fixed;
  bottom: $spacing * 2;
  right: $spacing * 2;
  display: flex;
  gap: $spacing;
  flex-direction: column;
  z-index: 5;

  @include mixins.sm {
    bottom: unset;
    top: $spacing * 2;
    left: $spacing * 2;
  }
}
</style>
