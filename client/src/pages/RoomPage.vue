<script setup lang="ts">
import { onBeforeMount, watch } from "vue"
import { useRouter, useRoute } from "vue-router"

import api from "@/utils/api"
import { user } from "@/contexts/user"

import AppGame from "@/components/AppGame/AppGame.vue"
import AppLoading from "@/components/AppLoading.vue"

const router = useRouter()
const route = useRoute()

function redirectNotLoggedIn() {
  router.replace({ path: "/login", query: { returnTo: route.fullPath } })
}

let creatingRoom = false
async function createRoom() {
  if (!user.value || creatingRoom) return

  creatingRoom = true
  const res = await api.get("/api/room")
  router.replace("/room/" + res.data.roomId)
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

watch(
  () => user.value,
  (newVal, oldVal) => {
    if (!user.fetching && !newVal && oldVal) return redirectNotLoggedIn()
    if (!route.params.id) createRoom()
  }
)
</script>

<template>
  <AppGame v-if="route.params.id" />
  <AppLoading v-else> Creating a room </AppLoading>
</template>

<style scoped lang="scss"></style>
