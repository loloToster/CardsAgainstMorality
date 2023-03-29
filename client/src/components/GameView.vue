<script setup lang="ts">
import { computed } from "vue"

import { ApiPlayer } from "@backend/types"
import { GameStage, GameState } from "../types/game"

import { moveItem } from "../utils"

import WinnerModal from "./WinnerModal.vue"
import AppButton from "./AppButton.vue"
import PlayingCard from "./PlayingCard.vue"
import GamePlayer from "./GamePlayer.vue"
import GameChoice from "./GameChoice.vue"

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

function onCardPick(cardId: number) {
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
          <div
            v-if="gameState.stage === GameStage.TSAR_VERDICT"
            class="game__choices"
          >
            <GameChoice
              v-for="choice in gameState.choices.length"
              @click="onChangeChoice(choice - 1)"
              @choose="$emit('verdict', choice - 1)"
              :choosable="gameState.imTsar"
              :active="choice - 1 === gameState.activeChoiceIdx"
              :num-of-cards="gameState.blackCard.pick"
              :key="choice"
            >
              {{ choice }}
            </GameChoice>
          </div>
          <div v-else class="game__submit">
            <div v-if="gameState.imTsar" class="game__ur-tsar">
              You are the <span>Tsar</span>
            </div>
            <AppButton
              v-else
              :disabled="
                gameState.pickedCards.length !== gameState.blackCard.pick ||
                gameState.submitted
              "
              @click="$emit('submit')"
              >{{ gameState.submitted ? "Submitted" : "Submit" }}</AppButton
            >
          </div>
        </div>
      </div>
      <div class="game__players">
        <GamePlayer
          v-for="player in players"
          :player="player"
          :key="player.name"
        />
      </div>
    </div>
    <div class="game__hand">
      <div
        v-for="card in gameState.cards"
        class="game__hand__card-wrapper"
        :key="card.id"
      >
        <PlayingCard
          @click="onCardPick(card.id)"
          class="game__hand__card"
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
    height: 80px;
  }

  &__submit {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__ur-tsar {
    font-size: 2.4rem;
    font-weight: bold;
    letter-spacing: 1px;

    span {
      background-image: linear-gradient(
        70deg,
        #c28d3e 0,
        #f8df61 30%,
        #f1eb95 50%,
        #f8df61 80%,
        #c28d3e 100%
      );
      color: transparent;
      background-clip: text;
      -webkit-background-clip: text;
    }
  }

  &__choices {
    display: flex;
    position: relative;
    justify-content: center;
    gap: 16px;
    width: fit-content;
    max-width: 100%;
    margin: auto;
  }

  &__players {
    width: 220px;
    max-height: 320px;
    flex-shrink: 0;
    overflow-y: auto;
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

        &::after {
          height: 60%;
        }
      }
    }
  }
}
</style>
