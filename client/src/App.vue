<script setup lang="ts">
import { RouterView } from "vue-router"

import api from "@/utils/api"
import { user } from "./contexts/user"

import AppHeader from "./components/AppHeader.vue"
import AppNotifications from "./components/AppNotifications/AppNotifications.vue"

api
  .get("/auth/me")
  .then(res => {
    user.value = res.data
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
