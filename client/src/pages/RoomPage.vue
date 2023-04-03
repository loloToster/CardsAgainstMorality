<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue"
import { useRoute } from "vue-router"

import type { ApiPlayer } from "@backend/types"
import { GameStage, GameState } from "../types/game"

import {
  setAuth as setSocketAuth,
  socket,
  socketState
} from "../contexts/socket"

import AppLoader from "../components/AppLoader.vue"
import GameView from "../components/GameView.vue"
import GameSettings from "../components/GameSettings.vue"

import NewRoundAudio from "../assets/new-round.mp3"
import TsarChoiceAudio from "../assets/tsar-choice.mp3"

const route = useRoute()

const state = reactive<{
  players: ApiPlayer[]
}>({
  players: []
})

const gameState = reactive<GameState>({
  audio: window.localStorage.getItem("audio") === "on",
  stage: GameStage.UNKNOWN,
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
  roundWinnerData: null,
  podium: null
})

const newRoundAudio = new Audio(NewRoundAudio)
const tsarChoiceAudio = new Audio(TsarChoiceAudio)

socket.on("players", ({ players }) => {
  state.players = players
})

socket.on("new-round", data => {
  if (gameState.audio) newRoundAudio.play()

  gameState.stage = GameStage.CHOOSING
  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards
  gameState.submitted = false
  gameState.roundWinnerData = data.prevRound ?? null
})

socket.on("choices", ({ choices }) => {
  if (gameState.audio) tsarChoiceAudio.play()

  gameState.stage = GameStage.TSAR_VERDICT
  gameState.activeChoiceIdx = null
  gameState.choices = choices
  gameState.pickedCards = []
})

socket.on("sync", data => {
  if (!data.started) {
    gameState.stage = GameStage.NOT_STARTED
    return
  }

  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards

  if (data.choices) {
    gameState.stage = GameStage.TSAR_VERDICT
    gameState.choices = data.choices
  } else {
    gameState.stage = GameStage.CHOOSING
  }
})

socket.on("end", ({ podium }) => {
  gameState.stage = GameStage.NOT_STARTED
  gameState.podium = podium
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

watch(
  () => socketState.connected,
  val => {
    if (!val) gameState.stage = GameStage.UNKNOWN
  }
)

const roomId = route.params.id
setSocketAuth({ roomId })

onMounted(() => {
  socket.connect()
})

onUnmounted(() => {
  socket.off("players")
  socket.off("new-round")
  socket.off("choices")
  socket.off("sync")
  socket.off("end")

  socket.disconnect()
})
</script>

<template>
  <div
    v-if="gameState.stage === GameStage.UNKNOWN || !socketState.connected"
    class="connecting"
  >
    <AppLoader outline-color="#242424" />
    <span>Connecting to the game</span>
  </div>
  <GameView
    v-else-if="gameState.stage !== GameStage.NOT_STARTED"
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

<style scoped lang="scss">
.connecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin: auto;
  margin-top: 20vh;
  padding: 48px;
  border: #c0c0c0 3px solid;
  border-radius: 12px;

  span {
    margin-top: 30px;
    font-size: 1.6rem;
  }
}
</style>
