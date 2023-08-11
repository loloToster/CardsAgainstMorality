<script setup lang="ts">
import { RouterView } from "vue-router"
import { useResizeObserver } from "@vueuse/core"

import api from "@/utils/api"
import { useScreenStore } from "@/contexts/screen"
import { useUserStore } from "@/contexts/user"

import AppHeader from "@/components/AppHeader.vue"
import AppNotifications from "@/components/AppNotifications/AppNotifications.vue"

const screen = useScreenStore()
const user = useUserStore()

useResizeObserver(document.body, () => {
  screen.size = document.body.clientWidth
})

api
  .get("/auth/me")
  .then(res => {
    user.login(res.data)
  })
  .finally(() => {
    user.fetching = false
  })
</script>

<template>
  <AppHeader v-if="!$route.meta?.hideHeader" />
  <RouterView />
  <AppNotifications />
</template>

<style scoped lang="scss"></style>
