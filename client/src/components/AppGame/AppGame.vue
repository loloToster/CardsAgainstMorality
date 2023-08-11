<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute } from "vue-router"

import type { SettingsData, VotingMeta } from "@backend/types"
import { GameStage } from "@/types/game"

import { useSocketStore } from "@/contexts/socket"
import { useNotificationsStore } from "@/contexts/notifications"
import { useAudioStore } from "@/contexts/audio"

import { useGameStateStore } from "./contexts/gamestate"
import { useGameSettingsStore } from "./contexts/gamesettings"

import AppLoading from "@/components/AppLoading.vue"
import GameView from "./GameView.vue"
import GameSettings from "./GameSettings.vue"
import PodiumModal from "./modals/PodiumModal.vue"

const route = useRoute()
const socketState = useSocketStore()
const { socket } = socketState
const notifications = useNotificationsStore()
const audio = useAudioStore()

const gameState = useGameStateStore()
const gameSettings = useGameSettingsStore()

useHead({ title: () => gameSettings.actualRoomName })

function hashChoice(ch: number[]) {
  return [...ch].sort((a, b) => a - b).join("-")
}

socket.on("players", data => {
  gameState.players = data.players

  if (data.kickedChoice) {
    const hashedKickedChoice = hashChoice(data.kickedChoice)
    gameState.choices = gameState.choices.filter(
      ch => hashChoice(ch.map(c => c.id)) !== hashedKickedChoice
    )

    if (gameState.stage === GameStage.TSAR_VERDICT)
      notifications.add({
        type: "info",
        text: "The player that was kicked has already submitted his choice so it was removed"
      })
  }
})

socket.on("sync-settings", data => {
  gameSettings.setByParsedSettings(data)
})

socket.on("new-round", data => {
  audio.play("new-round")

  gameState.timeLimit = data.timeLimit

  gameState.stage = GameStage.CHOOSING
  gameState.imTsar = data.tsar
  gameState.blackCard = data.blackCard
  gameState.cards = data.cards
  gameState.submitted = false
  gameState.pickedCards = []
  gameState.roundWinnerData = data.prevRound ?? null

  if (data.prevRound?.randomlyPicked) {
    notifications.add({
      type: "info",
      text: "The winner was chosen randomly due to Tsar inactivity"
    })
  }

  if (data.roundRestart) {
    notifications.add({
      type: "info",
      text: "The round was restarted due to disappearance of the Tsar"
    })
  }
})

socket.on("choices", data => {
  audio.play("tsar-choice")

  gameState.timeLimit = data.timeLimit

  gameState.stage = GameStage.TSAR_VERDICT
  gameState.activeChoiceIdx = null
  gameState.choices = data.choices
  gameState.pickedCards = []

  if (data.pickedCards) {
    notifications.add({
      type: "warn",
      text: "The time expired and your cards were picked randomly"
    })

    gameState.cards = gameState.cards.filter(
      c => !data.pickedCards?.includes(c.id)
    )
  }
})

socket.on("sync", data => {
  gameSettings.setByParsedSettings(data.currentSettings)

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
    gameState.submitted = data.submitted
  }
})

socket.on("end", ({ podium }) => {
  gameState.stage = GameStage.NOT_STARTED
  gameState.podium = podium

  gameState.resetPlayerState()
})

socket.on("voting", data => {
  gameState.voting = data
})

let settingsChangeTimeout: ReturnType<typeof setTimeout> | undefined
function onSettingsChange(data: Partial<SettingsData>) {
  if (gameState.stage === GameStage.UNKNOWN) return

  clearTimeout(settingsChangeTimeout)

  // debounce
  settingsChangeTimeout = setTimeout(() => {
    socket.emit("sync-settings", data)
  }, 500)
}

function onStart(data: SettingsData) {
  socket.emit("start", data)
}

function onSubmit() {
  gameState.submitted = true
  socket.emit("submit", {
    submition: gameState.pickedCards.map(c => c.id)
  })
  gameState.pickedCards = []
}

function onVerdict(choiceIdx: number) {
  socket.emit("verdict", {
    verdict: gameState.choices[choiceIdx].map(c => c.id)
  })
}

function onNewVoting(data: VotingMeta) {
  socket.emit("vote-start", data)
}

function onVote(data: boolean) {
  socket.emit("vote", { vote: data })
}

watch(
  () => socketState.connected,
  val => {
    if (!val) gameState.stage = GameStage.UNKNOWN
  }
)

const roomId = route.params.id
socketState.setAuth({ roomId })

onMounted(() => {
  socketState.init()
  socket.connect()
})

onUnmounted(() => {
  socket.off("players")
  socket.off("sync-settings")
  socket.off("new-round")
  socket.off("choices")
  socket.off("sync")
  socket.off("end")

  socket.disconnect()

  gameState.$reset()
})
</script>

<template>
  <PodiumModal
    v-if="gameState.podium"
    @close="gameState.podium = null"
    :podium="gameState.podium"
  />

  <AppLoading
    v-if="gameState.stage === GameStage.UNKNOWN || !socketState.connected"
  >
    Connecting to the game
  </AppLoading>
  <GameView
    v-else-if="gameState.stage !== GameStage.NOT_STARTED"
    @submit="onSubmit"
    @verdict="onVerdict"
    @new-voting="onNewVoting"
    @vote="onVote"
  />
  <GameSettings
    v-else
    :room-id="roomId.toString()"
    @change="onSettingsChange"
    @start="onStart"
  />
</template>

<style scoped lang="scss"></style>
