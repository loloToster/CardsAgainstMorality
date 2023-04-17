<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue"
import { useRoute } from "vue-router"

import { StartData, VotingMeta } from "@backend/types"
import { GameStage } from "../../types/game"

import {
  setAuth as setSocketAuth,
  socket,
  socketState
} from "../../contexts/socket"
import { notify } from "../../contexts/notifications"
import { playAudio } from "../../contexts/audio"
import {
  gameState,
  resetGameState,
  resetPlayerState
} from "./contexts/gamestate"

import AppLoader from "../AppLoader.vue"
import GameView from "./GameView.vue"
import GameSettings from "./GameSettings.vue"
import PodiumModal from "./modals/PodiumModal.vue"

const route = useRoute()

socket.on("players", data => {
  gameState.players = data.players
})

socket.on("new-round", data => {
  playAudio("new-round")

  gameState.timeLimit = data.timeLimit

  gameState.stage = GameStage.CHOOSING
  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards
  gameState.submitted = false
  gameState.roundWinnerData = data.prevRound ?? null
})

socket.on("choices", data => {
  playAudio("tsar-choice")

  gameState.stage = GameStage.TSAR_VERDICT
  gameState.activeChoiceIdx = null
  gameState.choices = data.choices
  gameState.pickedCards = []

  if (data.pickedCards) {
    notify({
      type: "warn",
      text: "The time expired and your cards where picked randomly"
    })

    gameState.cards = gameState.cards.filter(
      c => !data.pickedCards?.includes(c.id)
    )
  }
})

socket.on("sync", data => {
  if (!data.started) {
    gameState.stage = GameStage.NOT_STARTED
    return
  }

  gameState.timeLimit = data.timeLimit
  gameState.voting = data.voting

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

  resetPlayerState()
})

socket.on("voting", data => {
  gameState.voting = data
})

function onStart(data: StartData) {
  socket.emit("start", data)
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

function onNewVoting(data: VotingMeta) {
  socket.emit("vote", data)
}

function onVote(data: boolean) {
  socket.emit("vote", data)
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

  resetGameState()
})
</script>

<template>
  <PodiumModal
    v-if="gameState.podium"
    @close="gameState.podium = null"
    :podium="gameState.podium"
  />
  <div
    v-if="gameState.stage === GameStage.UNKNOWN || !socketState.connected"
    class="connecting"
  >
    <AppLoader outline-color="#242424" />
    <span>Connecting to the game</span>
  </div>
  <GameView
    v-else-if="gameState.stage !== GameStage.NOT_STARTED"
    @submit="onSubmit"
    @verdict="onVerdict"
    @new-voting="onNewVoting"
    @vote="onVote"
  />
  <GameSettings v-else :room-id="roomId.toString()" @start="onStart" />
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
