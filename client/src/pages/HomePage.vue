<script setup lang="ts">
import { useRouter } from "vue-router"
import PlayingCard from "../components/PlayingCard.vue"

const router = useRouter()

async function onRoomCreate() {
  const res = await fetch("/api/room")
  const json = await res.json()

  router.push("/room/" + json.roomId)
}
</script>

<template>
  <div class="container">
    <PlayingCard pack="" color="black"> I would like to ____. </PlayingCard>
    <PlayingCard @click="onRoomCreate" pack="" color="white">
      Create a room.
    </PlayingCard>
    <PlayingCard pack="" color="white"> Join a room. </PlayingCard>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  gap: 16px;
  width: fit-content;
  margin: auto;
  margin-top: 90px;
}
</style>
