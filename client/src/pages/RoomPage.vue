<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { useRoute } from "vue-router"

import { setAuth as setSocketAuth, socket } from "../contexts/socket"
import { BlackCard, Player, WhiteCard } from "../types/game"

import GameView from "../components/GameView.vue"
import GameSettings from "../components/GameSettings.vue"

const route = useRoute()

setSocketAuth({ roomId: route.params.id })
socket.connect()

onUnmounted(() => {
  socket.disconnect()
})

const state = reactive<{
  started: boolean
  blackCard: BlackCard
  cards: WhiteCard[]
  players: Player[]
}>({
  started: false,
  blackCard: { id: -1, text: "test", pack: "test pack" },
  cards: new Array(10).fill(null).map((_, i) => ({
    id: i,
    text: i.toString(),
    pack: "testpack"
  })),
  players: [{ img: "", name: "You", points: 0 }]
})

socket.on("new-round", data => {
  state.started = true
  state.blackCard = data.blackCard
  state.cards = data.cards
})

function onStart(packs: number[]) {
  socket.emit("start", { packs })
}
</script>

<template>
  <GameView
    v-if="state.started"
    :black-card="state.blackCard"
    :cards="state.cards"
    :players="state.players"
  />
  <GameSettings @start="onStart" v-else />
</template>

<style scoped lang="scss"></style>
