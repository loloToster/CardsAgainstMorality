<script setup lang="ts">
import { computed, reactive } from "vue"

import { ApiPlayer } from "@backend/types"
import { GameStage, GameState } from "../types/game"

import { moveItem } from "../utils"

import AppButton from "./AppButton.vue"

import PlayingCard from "./PlayingCard.vue"
import GamePlayers from "./GamePlayers.vue"
import UAreTsar from "./UAreTsar.vue"
import GameChoices from "./GameChoices.vue"
import WinnerModal from "./WinnerModal.vue"

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

const showedCard = reactive({ id: -1 })

function onCardShow(e: TouchEvent, cardId: number) {
  if (showedCard.id === cardId) return

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
</script>
<template>
  <WinnerModal
    v-if="gameState.winnerData"
    @close="gameState.winnerData = null"
    :winner="gameState.winnerData.winner"
    :black-card="gameState.winnerData.blackCard"
    :winning-cards="gameState.winnerData.winningCards"
    :im-winner="gameState.winnerData.imWinner"
  />
  <div class="game">
    <div class="game__top">
      <div class="game__table">
        <div class="game__table__cards">
          <PlayingCard
            :text="gameState.blackCard.text"
            :pack="gameState.blackCard.pack"
            :pick="gameState.blackCard.pick"
            color="black"
            :animated="!(gameState.pickedCards.length || activeChoice.length)"
            glow
          />
          <PlayingCard
            v-for="card in gameState.pickedCards"
            @click="onPickedCardClick(card.id)"
            :text="card.text"
            :pack="card.pack"
            color="white"
            :key="card.id"
          />
          <PlayingCard
            v-for="card in activeChoice"
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
    <div class="game__hand">
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
          :pack="card.pack"
          color="white"
        >
          {{ card.text }}
        </PlayingCard>
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
    flex-direction: column;
    justify-content: space-between;
    gap: $main-gap;
    flex-grow: 1;
    min-width: 0;

    &__cards {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
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

      &:hover &::after {
        height: 60%;
      }
    }
  }
}
</style>
