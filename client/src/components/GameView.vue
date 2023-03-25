<script setup lang="ts">
import { computed, reactive } from "vue"

import { ApiBlackCard, ApiPlayer, ApiWhiteCard } from "@backend/types"
import { GameStage } from "../types/game"

import AppButton from "./AppButton.vue"
import PlayingCard from "./PlayingCard.vue"
import GamePlayer from "./GamePlayer.vue"

const props = defineProps<{
  stage: GameStage
  imTsar: boolean
  blackCard: ApiBlackCard
  cards: ApiWhiteCard[]
  pickedCards: ApiWhiteCard[]
  submitted: boolean
  choices: ApiWhiteCard[][]
  players: ApiPlayer[]
}>()

const state = reactive<{ activeChoiceIdx: number | null }>({
  activeChoiceIdx: null
})

const activeChoice = computed(() => {
  return state.activeChoiceIdx !== null &&
    props.stage === GameStage.TSAR_VERDICT
    ? props.choices[state.activeChoiceIdx]
    : []
})

const emit = defineEmits<{
  (ev: "onCardPick", cardId: number): void
  (ev: "onPickedCardClick", cardId: number): void
  (ev: "submit"): void
  (ev: "verdict", choiceIdx: number): void
}>()

function onCardPick(cardId: number) {
  emit("onCardPick", cardId)
}

function onPickedCardClick(cardId: number) {
  emit("onPickedCardClick", cardId)
}

function onChangeChoice(choiceIdx: number) {
  if (choiceIdx === state.activeChoiceIdx) emit("verdict", choiceIdx)
  else state.activeChoiceIdx = choiceIdx
}
</script>
<template>
  <div class="game">
    <div class="game__top">
      <div class="game__table">
        <div class="game__table__cards">
          <PlayingCard
            :text="blackCard.text"
            :pack="blackCard.pack"
            color="black"
          />
          <PlayingCard
            v-for="card in pickedCards"
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
          <div v-if="stage === GameStage.TSAR_VERDICT" class="game__choices">
            <div
              v-for="choice in choices.length"
              @click="onChangeChoice(choice - 1)"
              :class="{ active: choice - 1 === state.activeChoiceIdx }"
              class="game__choices__choice"
              :key="choice"
            >
              {{ choice }}
            </div>
          </div>
          <div v-else class="game__submit">
            <div v-if="imTsar" class="game__ur-tsar">
              You are the <span>Tsar</span>
            </div>
            <AppButton
              v-else
              :disabled="pickedCards.length !== blackCard.pick || submitted"
              @click="$emit('submit')"
              >{{ submitted ? "Submitted" : "Submit" }}</AppButton
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
        v-for="card in cards"
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
    overflow-x: auto;
    margin: auto;

    &__choice {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      flex-shrink: 0;
      width: 56px;
      height: 80px;
      // margin to make space for pseudo-elements
      margin-left: 12px;

      color: black;
      background-color: white;
      box-shadow: -2px 1px 7px 0 #262626;
      border-radius: 4px;
      font-size: 1.8rem;
      font-weight: bold;
      cursor: pointer;
      transition: font-size 100ms linear;

      &.active {
        font-size: 3.3rem;
      }

      &::before,
      &::after {
        content: "";
        position: absolute;

        width: 100%;
        height: 100%;
        top: 0;

        border-radius: inherit;
        background-color: inherit;
        box-shadow: inherit;
        cursor: pointer;
      }

      &::before {
        left: -6px;
        z-index: -1;
      }

      &::after {
        left: -12px;
        z-index: -2;
      }
    }
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
