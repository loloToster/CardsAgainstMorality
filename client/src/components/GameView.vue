<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { useResizeObserver } from "@vueuse/core"

import { ApiPlayer } from "@backend/types"
import { GameStage, GameState } from "../types/game"

import { moveItem } from "../utils"

import AppButton from "./AppButton.vue"
import AppTooltip from "./AppTooltip.vue"

import PlayingCard from "./PlayingCard.vue"
import GamePlayers from "./GamePlayers.vue"
import UAreTsar from "./UAreTsar.vue"
import GameChoices from "./GameChoices.vue"
import RoundWinnerModal from "./RoundWinnerModal.vue"
import PodiumModal from "./PodiumModal.vue"

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

const state = reactive<{
  tableCardWidth: number | undefined
  showedCard: number
}>({
  tableCardWidth: undefined,
  showedCard: -1
})

function onAudioToggle() {
  props.gameState.audio = !props.gameState.audio
  window.localStorage.setItem("audio", props.gameState.audio ? "on" : "off")
}

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
  if (props.gameState.submitted) return

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

const numOfTableCards = computed(() => {
  return 1 + props.gameState.pickedCards.length + activeChoice.value.length
})

function resizeTableCards(w: number) {
  const g = (numOfTableCards.value - 1) * TABLE_CARDS_GAP
  state.tableCardWidth = Math.min((w - g) / numOfTableCards.value, MAX_CARD_W)
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
    <div class="game__menu">
      <button @click="onAudioToggle" class="game__menu__btn" v-wave>
        <AppTooltip class="game__menu__btn__tooltip">
          {{ gameState.audio ? "Turn off sound" : "Turn on sound" }}
        </AppTooltip>
        <svg
          v-if="gameState.audio"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 96 960 960"
        >
          <path
            d="M561.539 900.383v-61.999q86.538-27.538 139.422-100Q753.846 665.923 753.846 575q0-90.923-52.885-163.384-52.884-72.462-139.422-100v-61.999Q673.23 279.54 743.537 369.54q70.307 89.999 70.307 205.46 0 115.461-70.307 205.46-70.307 90-181.998 119.923ZM146.156 675.999V476.001h148.46l171.537-171.536v543.07L294.616 675.999h-148.46Zm415.383 46.154V427.847q40.461 22 62.537 61.961Q646.153 529.77 646.153 576q0 45.615-22.269 84.884t-62.345 61.269Z"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="M778.922 981.537 658.307 860.922q-20.769 13.307-43.769 23.076-22.999 9.769-47.614 16.385v-61.999q12.846-4.615 24.999-9.423 12.154-4.807 23-11.423L471.538 674.153v173.382L300.001 675.999h-148.46V476.001h121.845L79.848 282.463 122 240.31l699.074 699.074-42.153 42.153Zm-19.539-216.23-42.999-42.998q20.846-32.539 31.847-69.808 11-37.27 11-77.501 0-90.923-52.885-163.384-52.884-72.462-139.422-100v-61.999Q679 279.54 749.114 369.54q70.115 89.999 70.115 205.46 0 52.615-15.654 101.038-15.654 48.423-44.192 89.269Zm-122.461-122.46-69.998-69.999V427.847q40.461 22 62.537 61.961Q651.538 529.77 651.538 576q0 17.693-3.654 34.5-3.654 16.808-10.962 32.347ZM471.538 477.463l-86.307-86.692 86.307-86.306v172.998Z"
          />
        </svg>
      </button>
    </div>
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

  &__menu {
    position: absolute;
    top: 0;
    right: 0;
    transform: translateX(calc(100% + 10px));

    // TODO: find a good placefor menu on mobile
    @media (max-width: 900px) {
      display: none;
    }

    &__btn {
      width: 36px;
      height: 36px;
      appearance: none;
      margin: 0;
      padding: 0;
      border: 0;
      outline: 0;
      background-color: transparent;
      cursor: pointer;
      border-radius: 50%;

      svg {
        width: 32px;
        height: 32px;
        fill: #585858;
      }

      &__tooltip {
        display: none;
      }

      &:hover &__tooltip {
        display: block;
      }
    }
  }

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
