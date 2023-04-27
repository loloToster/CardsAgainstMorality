<script setup lang="ts">
import { onBeforeMount, watch } from "vue"
import { useRouter, useRoute } from "vue-router"

import { user } from "@/contexts/user"

import AppGame from "@/components/AppGame/AppGame.vue"
import AppLoading from "@/components/AppLoading.vue"

const router = useRouter()
const route = useRoute()

function redirectNotLoggedIn() {
  router.replace({ path: "/login", query: { returnTo: route.fullPath } })
}

async function createRoom() {
  if (!user.value) return

  const res = await fetch("/api/room")
  const json = await res.json()

  router.replace("/room/" + json.roomId)
}

onBeforeMount(() => {
  if (!user.value && !user.fetching) return redirectNotLoggedIn()
  if (!route.params.id) createRoom()
})

watch(
  () => user.fetching,
  (newVal, oldVal) => {
    if (!user.value && !newVal && oldVal) return redirectNotLoggedIn()
    if (!route.params.id) createRoom()
  }
)
</script>

<template>
  <AppGame v-if="route.params.id" />
  <AppLoading v-else> Creating a room </AppLoading>
</template>

<style scoped lang="scss"></style>
