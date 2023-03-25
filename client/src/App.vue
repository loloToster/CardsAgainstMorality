<script setup lang="ts">
import { ref } from "vue"
import { RouterView } from "vue-router"

import AppHeader from "./components/AppHeader.vue"
import type { LoggedInUser } from "./types/user"

const user = ref<LoggedInUser>(null)

fetch("/auth/me").then(async res => {
  if (res.ok) {
    user.value = await res.json()
  }
})
</script>

<template>
  <AppHeader v-if="!$route.meta?.hideHeader" :user="user" />
  <RouterView />
</template>

<style scoped lang="scss"></style>
