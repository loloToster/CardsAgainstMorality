<script setup lang="ts">
import { onMounted } from "vue"

import type { ApiBlackCard, ApiWhiteCard } from "@backend/types"

import confetti from "@/contexts/confetti"

import AppModal from "@/components/AppModal.vue"
import PlayingCard from "@/components/PlayingCard.vue"

const props = defineProps<{
  winner: string
  blackCard: ApiBlackCard
  winningCards: ApiWhiteCard[]
  imWinner: boolean
}>()

onMounted(() => {
  if (props.imWinner) confetti.addConfetti()
})

defineEmits(["close"])
</script>

<template>
  <AppModal @close="$emit('close')">
    <div class="round-winner-modal">
      <h1>
        <span>{{ winner }}</span> <span>won the round!</span>
      </h1>
      <div
        class="round-winner-modal__cards"
        :class="{
          'round-winner-modal__cards--single': winningCards.length === 1
        }"
      >
        <PlayingCard
          :text="blackCard.text"
          :pack="blackCard.pack"
          :pick="blackCard.pick"
          :draw="blackCard.draw"
          class="round-winner-modal__cards__card"
          color="black"
        />
        <div class="round-winner-modal__white-cards">
          <PlayingCard
            v-for="card in winningCards"
            :text="card.text"
            :pack="card.pack"
            class="round-winner-modal__cards__card"
            :key="card.id"
          />
        </div>
      </div>
      <div
        @animationend="$emit('close')"
        class="round-winner-modal__timer"
      ></div>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.round-winner-modal {
  h1 {
    max-width: 60vw;
    margin: 0;
    margin-bottom: 16px;
    font-size: clamp(1.2rem, 5vw, 2.4rem);

    span {
      display: inline-block;
    }

    @include mixins.xs {
      text-align: center;
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__cards {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    max-width: 90vw;
    overflow-x: auto;

    @include mixins.xs {
      flex-direction: column;
      align-items: center;
    }

    &--single {
      flex-direction: row;
    }

    &__card {
      --w: min(27vw, 220px);
    }
  }

  &__white-cards {
    display: flex;
    gap: 16px;

    @include mixins.xs {
      gap: 8px;
    }
  }

  @keyframes timer {
    from {
      width: 100px;
    }

    to {
      width: 0;
    }
  }

  &__timer {
    height: 3px;
    width: 100px;
    background-color: colors.$primary;

    animation: timer 10s linear;
  }
}
</style>
