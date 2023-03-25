<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { useRoute } from "vue-router"

import { ApiPlayer } from "@backend/types"
import { setAuth as setSocketAuth, socket } from "../contexts/socket"
import { GameStage, GameState } from "../types/game"

import GameView from "../components/GameView.vue"
import GameSettings from "../components/GameSettings.vue"

const route = useRoute()

const state = reactive<{
  players: ApiPlayer[]
}>({
  players: []
})

const gameState = reactive<GameState>({
  stage: GameStage.NOT_STARTED,
  imTsar: false,
  blackCard: { id: -1, text: "test", pack: "test pack", pick: 1 },
  cards: new Array(10).fill(null).map((_, i) => ({
    id: i,
    text: i.toString(),
    pack: "testpack"
  })),
  pickedCards: [],
  submitted: false,
  choices: [],
  activeChoiceIdx: null,
  winnerData: null
})

socket.on("players", ({ players }) => {
  state.players = players
})

socket.on("new-round", data => {
  gameState.stage = GameStage.CHOOSING
  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards
  gameState.submitted = false
  gameState.winnerData = data.prevRound ?? null
})

socket.on("choices", ({ choices }) => {
  gameState.stage = GameStage.TSAR_VERDICT
  gameState.activeChoiceIdx = null
  gameState.choices = choices
  gameState.pickedCards = []
})

socket.on("rejoin", data => {
  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards

  // todo: not started
  if (data.choices) {
    gameState.stage = GameStage.TSAR_VERDICT
    gameState.choices = data.choices
  } else {
    gameState.stage = GameStage.CHOOSING
  }
})

function onStart(packs: number[]) {
  socket.emit("start", { packs })
}

function onSubmit() {
  gameState.submitted = true
  socket.emit("submit", { submition: gameState.pickedCards.map(c => c.id) })
}

function onVerdict(choiceIdx: number) {
  socket.emit("verdict", {
    verdict: gameState.choices[choiceIdx].map(c => c.id)
  })
}

const roomId = route.params.id
setSocketAuth({ roomId })
socket.connect()

onUnmounted(() => {
  socket.disconnect()
})
</script>

<template>
  <GameView
    v-if="gameState.stage !== GameStage.NOT_STARTED"
    :game-state="gameState"
    :players="state.players"
    @submit="onSubmit"
    @verdict="onVerdict"
  />
  <GameSettings
    v-else
    :room-id="roomId.toString()"
    :players="state.players"
    @start="onStart"
  />
</template>

<style scoped lang="scss"></style>
