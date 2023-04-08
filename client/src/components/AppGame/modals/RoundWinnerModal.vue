<script setup lang="ts">
import { onMounted } from "vue"
import confetti from "../../../contexts/confetti"
import { ApiBlackCard, ApiWhiteCard } from "@backend/types"
import PlayingCard from "../../PlayingCard.vue"

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
  <div @click="$emit('close')" class="round-winner-modal">
    <div class="round-winner-modal__container">
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
  </div>
</template>

<style scoped lang="scss">
.round-winner-modal {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #0e0e0edd;
  z-index: 4;
  overflow: hidden;

  h1 {
    max-width: 60vw;
    margin: 0;
    margin-bottom: 16px;
    font-size: clamp(1.2rem, 5vw, 2.4rem);

    span {
      display: inline-block;
    }

    @media (max-width: 775px) {
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

    @media (max-width: 775px) {
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

    @media (max-width: 775px) {
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
    background-color: darkcyan;

    animation: timer 10s linear;
  }
}
</style>
