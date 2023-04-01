<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { useResizeObserver } from "@vueuse/core"

import { ApiPlayer } from "@backend/types"
import { GameStage, GameState } from "../types/game"

import { moveItem } from "../utils"

import AppButton from "./AppButton.vue"

import PlayingCard from "./PlayingCard.vue"
import GamePlayers from "./GamePlayers.vue"
import UAreTsar from "./UAreTsar.vue"
import GameChoices from "./GameChoices.vue"
import RoundWinnerModal from "./RoundWinnerModal.vue"

const props = defineProps<{
  gameState: GameState
  players: ApiPlayer[]
}>()

const activeChoice = computed(() => {
  return props.gameState.activeChoiceIdx !== null &&
    props.gameState.stage === GameStage.TSAR_VERDICT
    ? props.gameState.choices[props.gameState.activeChoiceIdx]
    : []
})

defineEmits<{
  (ev: "submit"): void
  (ev: "verdict", choiceIdx: number): void
}>()

const hand = ref<HTMLDivElement>()

const showedCard = reactive({ id: -1 })

function onCardShow(e: TouchEvent, cardId: number) {
  if (showedCard.id === cardId) {
    showedCard.id = -1
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
      showedCard.id = -1
      return
    }
  }

  showedCard.id = cardId
  e.preventDefault()
}

function onCardPick(cardId: number) {
  showedCard.id = -1

  if (
    props.gameState.pickedCards.length >= props.gameState.blackCard.pick ||
    props.gameState.stage !== GameStage.CHOOSING ||
    props.gameState.imTsar
  )
    return

  moveItem(
    props.gameState.cards,
    props.gameState.pickedCards,
    c => c.id === cardId
  )
}

function onPickedCardClick(cardId: number) {
  moveItem(
    props.gameState.pickedCards,
    props.gameState.cards,
    c => c.id === cardId
  )
}

function onChangeChoice(choiceIdx: number) {
  props.gameState.activeChoiceIdx = choiceIdx
}

const TABLE_CARDS_GAP = 8
const MAX_CARD_W = 226
const table = ref<HTMLDivElement>()
const tableCardsState = reactive<{ w: number | undefined }>({ w: undefined })

const numOfTableCards = computed(() => {
  return 1 + props.gameState.pickedCards.length + activeChoice.value.length
})

function resizeTableCards(w: number) {
  const g = (numOfTableCards.value - 1) * TABLE_CARDS_GAP
  tableCardsState.w = Math.min((w - g) / numOfTableCards.value, MAX_CARD_W)
}

useResizeObserver(table, entries => {
  const entry = entries[0]
  const { width } = entry.contentRect
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
  <RoundWinnerModal
    v-if="gameState.winnerData"
    @close="gameState.winnerData = null"
    :winner="gameState.winnerData.winner"
    :black-card="gameState.winnerData.blackCard"
    :winning-cards="gameState.winnerData.winningCards"
    :im-winner="gameState.winnerData.imWinner"
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
          :style="{ '--table-cards-width': TABLE_CARDS_GAP }"
        >
          <PlayingCard
            :width="tableCardsState.w"
            :text="gameState.blackCard.text"
            :pack="gameState.blackCard.pack"
            :pick="gameState.blackCard.pick"
            color="black"
            :animated="numOfTableCards === 1"
            glow
          />
          <PlayingCard
            v-for="card in gameState.pickedCards"
            :width="tableCardsState.w"
            @click="onPickedCardClick(card.id)"
            :text="card.text"
            :pack="card.pack"
            color="white"
            :key="card.id"
          />
          <PlayingCard
            v-for="card in activeChoice"
            :width="tableCardsState.w"
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
      <GamePlayers :players="players" />
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
          :class="{ active: card.id === showedCard.id }"
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
  width: 90vw;
  max-width: 1100px;
  margin: auto;

  &__top {
    display: flex;
    gap: $main-gap;
    margin-bottom: $main-gap * 2;
  }

  &__table {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    gap: $main-gap;
    flex-grow: 1;

    &.active {
      overflow: hidden;
    }

    &__cards {
      display: flex;
      align-items: center;
      gap: calc(var(--table-cards-width, 8) * 1px);
      height: 325px;
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
