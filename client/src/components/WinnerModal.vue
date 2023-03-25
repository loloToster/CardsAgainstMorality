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
  }

  &__cards {
    display: flex;
    gap: 16px;
  }
}
</style>
