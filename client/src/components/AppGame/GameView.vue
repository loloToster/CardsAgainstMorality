<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { useResizeObserver } from "@vueuse/core"

import { VotingMeta } from "@backend/types"
import { GameStage } from "../../types/game"

import { gameState } from "./contexts/gamestate"

import { moveItem } from "../../utils"

import AppButton from "../AppButton.vue"
import PlayingCard from "../PlayingCard.vue"

import RoundWinnerModal from "./modals/RoundWinnerModal.vue"
import PodiumModal from "./modals/PodiumModal.vue"

import GameVoting from "./game-components/GameVoting.vue"
import GameMeta from "./game-components/GameMeta.vue"
import UAreTsar from "./game-components/UAreTsar.vue"
import GameChoices from "./game-components/GameChoices.vue"

const activeChoice = computed(() => {
  return gameState.activeChoiceIdx !== null &&
    gameState.stage === GameStage.TSAR_VERDICT
    ? gameState.choices[gameState.activeChoiceIdx]
    : []
})

defineEmits<{
  (ev: "submit"): void
  (ev: "verdict", choiceIdx: number): void
  (ev: "new-voting", data: VotingMeta): void
  (ev: "vote", data: boolean): void
}>()

enum MAX_CARD_WIDTH {
  SMALL = 160,
  BIG = 226
}

enum CARD_HEIGHT {
  SMALL = 228,
  BIG = 325
}

const SMALLER_CARDS_BOUNDARY = 500

const state = reactive<{
  maxTableCardWidth: MAX_CARD_WIDTH
  tableCardHeight: number | undefined
  tableCardWidth: number | undefined
  showedCard: number
}>({
  maxTableCardWidth: MAX_CARD_WIDTH.BIG,
  tableCardHeight: undefined,
  tableCardWidth: undefined,
  showedCard: -1
})

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
const table = ref<HTMLDivElement>()

const numOfTableCards = computed(() => {
  return 1 + gameState.pickedCards.length + activeChoice.value.length
})

function resizeTableCards(w: number) {
  const g = (numOfTableCards.value - 1) * TABLE_CARDS_GAP
  state.tableCardWidth = Math.min(
    (w - g) / numOfTableCards.value,
    state.maxTableCardWidth
  )
}

useResizeObserver(table, entries => {
  const entry = entries[0]
  const { width } = entry.contentRect

  if (width < SMALLER_CARDS_BOUNDARY) {
    state.maxTableCardWidth = MAX_CARD_WIDTH.SMALL
    state.tableCardHeight = CARD_HEIGHT.SMALL
  } else {
    state.maxTableCardWidth = MAX_CARD_WIDTH.BIG
    state.tableCardHeight = CARD_HEIGHT.BIG
  }

  resizeTableCards(width)
})

watch(
  () => numOfTableCards.value,
  () => {
    if (!table.value) return
    const { width } = table.value.getBoundingClientRect()
    resizeTableCards(width)
  }
)

function onCardsScroll(e: WheelEvent) {
  e.preventDefault()

  hand.value?.scrollBy({
    left: e.deltaY
  })
}
</script>
<template>
  <GameVoting
    v-if="gameState.voting"
    :voting-data="gameState.voting"
    @vote="d => $emit('vote', d)"
    @counter-end="gameState.voting = null"
  />
  <RoundWinnerModal
    v-if="gameState.roundWinnerData"
    @close="gameState.roundWinnerData = null"
    :winner="gameState.roundWinnerData.winner"
    :black-card="gameState.roundWinnerData.blackCard"
    :winning-cards="gameState.roundWinnerData.winningCards"
    :im-winner="gameState.roundWinnerData.imWinner"
  />
  <PodiumModal
    v-if="gameState.podium"
    @close="gameState.podium = null"
    :podium="gameState.podium"
  />
  <div class="game">
    <div class="game__top">
      <div
        class="game__table"
        ref="table"
        :class="{ active: numOfTableCards !== 1 }"
      >
        <div
          class="game__table__cards"
          :style="{
            '--table-cards-height': state.tableCardHeight,
            '--table-cards-gap': TABLE_CARDS_GAP
          }"
        >
          <PlayingCard
            :width="state.tableCardWidth"
            :text="gameState.blackCard.text"
            :pack="gameState.blackCard.pack"
            :pick="gameState.blackCard.pick"
            color="black"
            :animated="numOfTableCards === 1"
            glow
          />
          <PlayingCard
            v-for="card in gameState.pickedCards"
            :width="state.tableCardWidth"
            @click="onPickedCardClick(card.id)"
            :text="card.text"
            :pack="card.pack"
            color="white"
            :key="card.id"
          />
          <PlayingCard
            v-for="card in activeChoice"
            :width="state.tableCardWidth"
            :text="card.text"
            :pack="card.pack"
            color="white"
            :key="card.id"
          />
        </div>
        <div class="game__under-cards">
          <GameChoices
            v-if="gameState.stage === GameStage.TSAR_VERDICT"
            @change-idx="onChangeChoice"
            @choose="i => $emit('verdict', i)"
            :active-idx="gameState.activeChoiceIdx"
            :num-of-choices="gameState.choices.length"
            :num-of-cards="gameState.blackCard.pick"
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
      <GameMeta @new-voting="d => $emit('new-voting', d)" />
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
$main-gap: 20px;
.game {
  position: relative;
  width: 90vw;
  max-width: 1100px;
  margin: auto;

  &__top {
    display: flex;
    gap: $main-gap;
    margin-bottom: $main-gap * 2;

    @media (max-width: 800px) {
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

    @media (max-width: 800px) {
      gap: $main-gap * 0.5;
    }

    &.active {
      overflow: hidden;
    }

    &__cards {
      display: flex;
      align-items: center;
      gap: calc(var(--table-cards-gap, 8) * 1px);
      height: calc(var(--table-cards-height, 325) * 1px);
      width: fit-content;
      max-width: 100%;
      margin: auto;
    }
    &.active &__cards {
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  &__under-cards {
    height: 100px;
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

    @media (max-width: 900px) {
      gap: 8px;
      overflow-x: scroll;

      &__card-wrapper {
        flex: unset;
        flex-shrink: 0;
      }

      &__card {
        --w: 150px;

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
