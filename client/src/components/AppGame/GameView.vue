<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from "vue"
import { syncRefs, useResizeObserver } from "@vueuse/core"

import { CARD_ASPECT_WIDTH, CARD_ASPECT_HEIGHT } from "@/consts"

import type { VotingMeta } from "@backend/types"
import { GameStage } from "@/types/game"

import { useAudioStore } from "@/contexts/audio"
import { useGameStateStore } from "./contexts/gamestate"
import { target as pictureTarget, onPictureTake } from "./contexts/screenshot"

import { moveItem } from "@/utils"

import AppButton from "@/components/AppButton.vue"
import PlayingCard from "@/components/PlayingCard.vue"

import KickPlayerModal from "./modals/KickPlayerModal.vue"
import RoundWinnerModal from "./modals/RoundWinnerModal.vue"
import TablePictureModal from "./modals/TablePictureModal.vue"

import GameTimer from "./game-components/GameTimer.vue"
import GameVoting from "./game-components/GameVoting.vue"
import GameMeta from "./game-components/GameMeta.vue"
import UAreTsar from "./game-components/UAreTsar.vue"
import GameChoices from "./game-components/GameChoices.vue"

defineEmits<{
  (ev: "submit"): void
  (ev: "verdict", choiceIdx: number): void
  (ev: "new-voting", data: VotingMeta): void
  (ev: "vote", data: boolean): void
  (ev: "kick", playerId: number): void
}>()

const audio = useAudioStore()
const gameState = useGameStateStore()

const activeChoice = computed(() => {
  return gameState.activeChoiceIdx !== null &&
    gameState.stage === GameStage.TSAR_VERDICT
    ? gameState.choices[gameState.activeChoiceIdx]
    : []
})

const state = reactive<{
  kickPlayerModalActive: boolean
  tableCardWidth: number | undefined
  showedCard: number
  tablePicture: HTMLCanvasElement | null
}>({
  kickPlayerModalActive: false,
  tableCardWidth: undefined,
  showedCard: -1,
  tablePicture: null
})

watch(
  () => gameState.voting,
  newVal => {
    if (newVal) state.kickPlayerModalActive = false
  }
)

const hand = ref<HTMLDivElement>()

function onCardShow(e: TouchEvent, cardId: number) {
  if (state.showedCard === cardId) {
    state.showedCard = -1
    return
  }

  // if cards are already visible
  if (hand.value) {
    const firstCardWrapper = hand.value.querySelector(
      ".game__hand__card-wrapper"
    )
    const firstCard = firstCardWrapper?.querySelector(".card")

    if (
      firstCardWrapper &&
      firstCard &&
      firstCardWrapper.getBoundingClientRect().width ===
        firstCard.getBoundingClientRect().width
    ) {
      state.showedCard = -1
      return
    }
  }

  state.showedCard = cardId
  e.preventDefault()
}

function onCardPick(cardId: number) {
  state.showedCard = -1

  if (
    !gameState.blackCard.pick ||
    gameState.pickedCards.length >= gameState.blackCard.pick ||
    gameState.stage !== GameStage.CHOOSING ||
    gameState.imTsar
  )
    return

  moveItem(gameState.cards, gameState.pickedCards, c => c.id === cardId)
}

function onPickedCardClick(cardId: number) {
  if (gameState.submitted) return

  moveItem(gameState.pickedCards, gameState.cards, c => c.id === cardId)
}

function onChangeChoice(choiceIdx: number) {
  gameState.activeChoiceIdx = choiceIdx
}

const TABLE_CARDS_GAP = 8
const tableCards = ref<HTMLDivElement>()
const timer = ref<HTMLDivElement>()
const timerWrapper = ref<HTMLDivElement>()

const numOfTableCards = computed(() => {
  return 1 + gameState.pickedCards.length + activeChoice.value.length
})

const timerWarn = computed(() => {
  return (
    (gameState.stage === GameStage.TSAR_VERDICT && gameState.imTsar) ||
    (gameState.stage === GameStage.CHOOSING &&
      !gameState.imTsar &&
      !gameState.submitted)
  )
})

function resizeTableCards(tableWidth: number, tableHeight: number) {
  const g = (numOfTableCards.value - 1) * TABLE_CARDS_GAP

  const maxCardWidth = (tableHeight / CARD_ASPECT_HEIGHT) * CARD_ASPECT_WIDTH

  const cardWidth = Math.min(
    (tableWidth - g) / numOfTableCards.value,
    maxCardWidth
  )

  let additionalPadding = 0

  if (timer.value) {
    const timerWrapperX = timerWrapper.value?.getBoundingClientRect().x || 0
    const timerX = timer.value?.getBoundingClientRect().x || 0
    const neededPadding = (timerWrapperX - timerX) * 2
    const exisitingPadding = tableWidth - numOfTableCards.value * cardWidth - g

    if (exisitingPadding < neededPadding)
      additionalPadding = neededPadding - exisitingPadding
  }

  state.tableCardWidth = cardWidth - additionalPadding / numOfTableCards.value
}

useResizeObserver(tableCards, entries => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  resizeTableCards(width, height)
})

watch(
  () => numOfTableCards.value,
  () => {
    if (!tableCards.value) return
    const { width, height } = tableCards.value.getBoundingClientRect()
    resizeTableCards(width, height)
  }
)

let flashTimeout: ReturnType<typeof setTimeout> | undefined
const flash = ref<HTMLDivElement>()
syncRefs(tableCards, pictureTarget)

function runFlashAnimation() {
  audio.play("camera")
  flash.value?.classList.remove("flash")
  void flash.value?.offsetHeight
  flash.value?.classList.add("flash")
}

onPictureTake(canvas => {
  runFlashAnimation()

  flashTimeout = setTimeout(() => {
    state.tablePicture = canvas
  }, 800)
})

onUnmounted(() => clearTimeout(flashTimeout))

function onCardsScroll(e: WheelEvent) {
  e.preventDefault()

  hand.value?.scrollBy({
    left: e.deltaY
  })
}
</script>
<template>
  <KickPlayerModal
    v-if="state.kickPlayerModalActive"
    :players="gameState.players"
    @close="state.kickPlayerModalActive = false"
    @kick="pId => $emit('new-voting', { type: 'kick', playerId: pId })"
  />
  <GameVoting
    v-if="gameState.voting"
    :voting-data="gameState.voting"
    :players="gameState.players"
    @vote="d => $emit('vote', d)"
    @counter-end="gameState.voting = null"
  />
  <TablePictureModal
    v-if="state.tablePicture"
    @close="state.tablePicture = null"
    :canvas="state.tablePicture"
  />
  <RoundWinnerModal
    v-else-if="gameState.roundWinnerData"
    @close="gameState.roundWinnerData = null"
    :winner="gameState.roundWinnerData.winner"
    :black-card="gameState.roundWinnerData.blackCard"
    :winning-cards="gameState.roundWinnerData.winningCards"
    :im-winner="gameState.roundWinnerData.imWinner"
  />
  <div class="game">
    <div class="game__top">
      <div class="game__table">
        <div class="game__table__flash-wrapper">
          <div
            class="game__table__cards"
            ref="tableCards"
            :style="{
              '--table-cards-gap': TABLE_CARDS_GAP
            }"
          >
            <div ref="timerWrapper" class="game__table__timer-wrapper">
              <div ref="timer" class="game__table__timer">
                <!-- :key prop is used to reset the time everytime the stage of the game is changed -->
                <GameTimer
                  v-if="gameState.timeLimit"
                  :from="gameState.timeLimit"
                  :shake-boundry="timerWarn ? 30 : 0"
                  :warning-boundry="timerWarn ? 10 : 0"
                  :key="gameState.stage"
                />
              </div>
              <PlayingCard
                class="game__table__card"
                :width="state.tableCardWidth"
                :text="gameState.blackCard.text"
                :pack="gameState.blackCard.pack"
                :pick="gameState.blackCard.pick"
                :draw="gameState.blackCard.draw"
                color="black"
                :animated="numOfTableCards === 1"
                glow
              />
            </div>
            <PlayingCard
              v-for="card in gameState.pickedCards"
              @click="onPickedCardClick(card.id)"
              class="game__table__card"
              :width="state.tableCardWidth"
              :text="card.text"
              :pack="card.pack"
              color="white"
              :key="card.id"
            />
            <PlayingCard
              v-for="card in activeChoice"
              class="game__table__card"
              :width="state.tableCardWidth"
              :text="card.text"
              :pack="card.pack"
              color="white"
              :key="card.id"
            />
          </div>
          <div ref="flash" class="game__table__flash"></div>
        </div>
        <div class="game__under-cards">
          <GameChoices
            v-if="gameState.stage === GameStage.TSAR_VERDICT"
            @change-idx="onChangeChoice"
            @choose="i => $emit('verdict', i)"
            :active-idx="gameState.activeChoiceIdx"
            :num-of-choices="gameState.choices.length"
            :num-of-cards="gameState.blackCard.pick ?? 1"
            :choosable="gameState.imTsar"
          />
          <div v-else class="game__submit">
            <UAreTsar v-if="gameState.imTsar" />
            <AppButton
              v-else
              :disabled="
                gameState.pickedCards.length !== gameState.blackCard.pick ||
                gameState.submitted
              "
              @click="$emit('submit')"
            >
              {{ gameState.submitted ? "Submitted" : "Submit" }}
            </AppButton>
          </div>
        </div>
      </div>
      <GameMeta
        @new-voting="d => $emit('new-voting', d)"
        @open-kick="state.kickPlayerModalActive = true"
        @kick="pId => $emit('kick', pId)"
      />
    </div>
    <div @wheel="onCardsScroll" class="game__hand" ref="hand">
      <div
        v-for="card in gameState.cards"
        class="game__hand__card-wrapper"
        :key="card.id"
      >
        <PlayingCard
          @touchend="e => onCardShow(e, card.id)"
          @click="onCardPick(card.id)"
          class="game__hand__card"
          :class="{ active: card.id === state.showedCard }"
          :text="card.text"
          :pack="card.pack"
          color="white"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/variables" as vars;

$main-gap: 20px;

.game {
  isolation: isolate;
  position: relative;
  width: 90vw;
  max-width: 1100px;
  margin: auto;
  margin-top: 2vh;

  &__top {
    display: flex;
    gap: $main-gap;
    margin-bottom: $main-gap * 2;

    @include mixins.xs {
      gap: $main-gap * 0.5;
      margin-bottom: $main-gap;
    }
  }

  &__table {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: $main-gap;
    flex-grow: 1;
    min-width: 0;
    max-width: 100%;

    @include mixins.xs {
      gap: $main-gap * 0.5;
    }

    @keyframes flash {
      from {
        opacity: 0.8;
      }

      15% {
        opacity: 1;
      }

      20% {
        opacity: 1;
      }

      to {
        opacity: 0;
      }
    }

    &__flash-wrapper {
      position: relative;
      width: 100%;
    }

    &__flash {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      background-color: white;
      opacity: 0;

      &.flash {
        animation: flash 1000ms ease-out;
      }
    }

    &__cards {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: calc(var(--table-cards-gap, 8) * 1px);
      height: min(33vh, #{vars.$default-card-height});
      width: 100%;
      margin: auto;
    }

    &__timer-wrapper {
      position: relative;
    }

    &__timer {
      position: absolute;
      top: 8px;
      left: 0;
      transform: translateX(calc(-100% - min(0.8vw, 10px)));
    }
  }

  &__under-cards {
    height: min(11vh, 110px);
    width: 100%;
  }

  &__submit {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__hand {
    display: flex;
    margin: auto;
    margin-bottom: 60px;

    &__card-wrapper {
      flex: 1 1 0;
      min-width: 0;

      &:last-child {
        flex: unset;
      }
    }

    &__card {
      --h: min(33vh, #{vars.$default-card-height});

      position: relative;
      z-index: 2;
      cursor: pointer;
      transition: transform ease-in-out 100ms;

      &::after {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        height: 0;
        width: 100%;
        transform: translateY(100%);
        transition: height ease-in-out 100ms;
      }

      &:hover,
      &.active {
        transform: translateY(-60%);
      }

      &:hover::after {
        height: 60%;
      }
    }

    @include mixins.sm {
      gap: 8px;
      overflow-x: scroll;

      &__card-wrapper {
        flex: unset;
        flex-shrink: 0;
      }

      &__card {
        &:hover,
        &.active {
          transform: unset;
        }

        &:hover::after {
          height: 0;
        }
      }
    }
  }
}
</style>
