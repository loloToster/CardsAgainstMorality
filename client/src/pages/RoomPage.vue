<script setup lang="ts">
import { onBeforeMount, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { user } from "@/contexts/user"
import AppGame from "@/components/AppGame/AppGame.vue"

const router = useRouter()
const route = useRoute()

function redirectNotLoggedIn() {
  router.push({ path: "/login", query: { room: route.params.id } })
}

onBeforeMount(() => {
  if (!user.value && !user.fetching) redirectNotLoggedIn()
})

watch(
  () => user.fetching,
  (newVal, oldVal) => {
    if (!user.value && !newVal && oldVal) redirectNotLoggedIn()
  }
)
</script>

<template>
  <AppGame />
</template>

<style scoped lang="scss"></style>
