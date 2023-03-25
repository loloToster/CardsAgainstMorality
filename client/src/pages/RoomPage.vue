<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { useRoute } from "vue-router"

import { ApiWhiteCard, ApiBlackCard, ApiPlayer } from "@backend/types"
import { moveItem } from "../utils"
import { setAuth as setSocketAuth, socket } from "../contexts/socket"
import { GameStage } from "../types/game"

import GameView from "../components/GameView.vue"
import GameSettings from "../components/GameSettings.vue"

const route = useRoute()

// TODO: move game logic to GameView
const state = reactive<{
  stage: GameStage
  imTsar: boolean
  blackCard: ApiBlackCard
  cards: ApiWhiteCard[]
  pickedCards: ApiWhiteCard[]
  submitted: boolean
  choices: ApiWhiteCard[][]
  winnerData: {
    winner: string
    blackCard: ApiBlackCard
    winningCards: ApiWhiteCard[]
    imWinner: boolean
  } | null
  players: ApiPlayer[]
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
  submitted: false,
  choices: [],
  winnerData: null,
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
  state.submitted = false
  state.winnerData = data.prevRound ?? null
})

socket.on("choices", ({ choices }) => {
  state.stage = GameStage.TSAR_VERDICT
  state.choices = choices
  state.pickedCards = []
})

socket.on("rejoin", data => {
  state.imTsar = data.tsar
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
  state.submitted = true
  socket.emit("submit", { submition: state.pickedCards.map(c => c.id) })
}

function onVerdict(choiceIdx: number) {
  socket.emit("verdict", { verdict: state.choices[choiceIdx].map(c => c.id) })
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
    v-if="state.stage !== GameStage.NOT_STARTED"
    :stage="state.stage"
    :im-tsar="state.imTsar"
    :black-card="state.blackCard"
    :cards="state.cards"
    :picked-cards="state.pickedCards"
    :submitted="state.submitted"
    :choices="state.choices"
    :winner-data="state.winnerData"
    :players="state.players"
    @on-card-pick="onCardPick"
    @on-picked-card-click="onCardPickRemove"
    @submit="onSubmit"
    @verdict="onVerdict"
    @on-winner-close="state.winnerData = null"
  />
  <GameSettings
    v-else
    :room-id="roomId.toString()"
    :players="state.players"
    @start="onStart"
  />
</template>

<style scoped lang="scss"></style>
