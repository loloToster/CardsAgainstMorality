<script setup lang="ts">
import confetti from "../contexts/confetti"
import { ApiBlackCard, ApiWhiteCard } from "@backend/types"
import PlayingCard from "./PlayingCard.vue"
import { onMounted } from "vue"

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
  <div @click="$emit('close')" class="winner-modal">
    <div class="winner-modal__container">
      <h1>{{ winner }} won the round!</h1>
      <div class="winner-modal__cards">
        <PlayingCard
          :text="blackCard.text"
          :pack="blackCard.pack"
          color="black"
        />
        <PlayingCard
          v-for="card in winningCards"
          :text="card.text"
          :pack="card.pack"
          :key="card.id"
        />
      </div>
      <div @animationend="$emit('close')" class="winner-modal__timer"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.winner-modal {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #0e0e0edd;
  z-index: 1;

  h1 {
    max-width: 60vw;
    margin: 0;
    margin-bottom: 16px;
  }

  &__cards {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
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
