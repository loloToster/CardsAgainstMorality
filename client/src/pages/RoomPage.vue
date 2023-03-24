<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { useRoute } from "vue-router"

import { moveItem } from "../utils"
import { setAuth as setSocketAuth, socket } from "../contexts/socket"
import { BlackCard, GameStage, Player, WhiteCard } from "../types/game"

import GameView from "../components/GameView.vue"
import GameSettings from "../components/GameSettings.vue"

const route = useRoute()

// TODO: move game logic to GameView
const state = reactive<{
  stage: GameStage
  imTsar: boolean
  blackCard: BlackCard
  cards: WhiteCard[]
  pickedCards: WhiteCard[]
  choices: WhiteCard[][]
  players: Player[]
}>({
  stage: GameStage.NOT_STARTED,
  imTsar: false,
  blackCard: { id: -1, text: "test", pack: "test pack", pick: 1 },
  cards: new Array(10).fill(null).map((_, i) => ({
    id: i,
    text: i.toString(),
    pack: "testpack"
  })),
  pickedCards: [],
  choices: [],
  players: []
})

socket.on("players", ({ players }) => {
  state.players = players
})

socket.on("new-round", data => {
  state.stage = GameStage.CHOOSING
  state.imTsar = data.tsar
  state.blackCard = data.blackCard
  state.cards = data.cards
})

socket.on("choices", ({ choices }) => {
  state.stage = GameStage.TSAR_VERDICT
  state.choices = choices
  state.pickedCards = []
})

socket.on("rejoin", data => {
  state.imTsar = data.isTsar
  state.blackCard = data.blackCard
  state.cards = data.cards

  // todo: not started
  if (data.choices) {
    state.stage = GameStage.TSAR_VERDICT
    state.choices = data.choices
  } else {
    state.stage = GameStage.CHOOSING
  }
})

function onStart(packs: number[]) {
  socket.emit("start", { packs })
}

function onCardPick(cardId: number) {
  if (
    state.pickedCards.length >= state.blackCard.pick ||
    state.stage !== GameStage.CHOOSING ||
    state.imTsar
  )
    return

  moveItem(state.cards, state.pickedCards, c => c.id === cardId)
}

function onCardPickRemove(cardId: number) {
  moveItem(state.pickedCards, state.cards, c => c.id === cardId)
}

function onSubmit() {
  socket.emit(
    "submit",
    state.pickedCards.map(c => c.id)
  )
}

function onVerdict(choiceIdx: number) {
  socket.emit(
    "verdict",
    state.choices[choiceIdx].map(c => c.id)
  )
}

setSocketAuth({ roomId: route.params.id })
socket.connect()

onUnmounted(() => {
  socket.disconnect()
})
</script>

<template>
  <GameView
    v-if="state.stage !== GameStage.NOT_STARTED"
    :stage="state.stage"
    :im-tsar="state.imTsar"
    :black-card="state.blackCard"
    :cards="state.cards"
    :picked-cards="state.pickedCards"
    :choices="state.choices"
    :players="state.players"
    @on-card-pick="onCardPick"
    @on-picked-card-click="onCardPickRemove"
    @submit="onSubmit"
    @verdict="onVerdict"
  />
  <GameSettings v-else :players="state.players" @start="onStart" />
</template>

<style scoped lang="scss"></style>
