<script setup lang="ts">
import { RouterView } from "vue-router"

import { user } from "./contexts/user"

import AppHeader from "./components/AppHeader.vue"

fetch("/auth/me").then(async res => {
  if (res.ok) {
    user.value = await res.json()
  }
})
</script>

<template>
  <AppHeader v-if="!$route.meta?.hideHeader" />
  <RouterView />
</template>

<style scoped lang="scss"></style>
