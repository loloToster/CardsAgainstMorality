<script setup lang="ts">
import { computed } from "vue"

import { user } from "@/contexts/user"

import { ApiPlayer } from "@backend/types"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"
import UserAvatar from "@/components/UserAvatar.vue"

const props = defineProps<{ players: ApiPlayer[] }>()

defineEmits(["close"])

const filteredPlayers = computed(() => {
  return props.players.filter(p => p.userId !== user.value?.id)
})

function handleClick(playerId: number) {
  console.log(playerId)
}
</script>

<template>
  <AppModal @close="$emit('close')">
    <div class="kick-modal">
      <button @click="$emit('close')" class="kick-modal__close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
          />
        </svg>
      </button>
      <h1>Kick a player</h1>
      <div class="kick-modal__players">
        <AppButton
          v-for="player in filteredPlayers"
          @click="handleClick(player.userId)"
          class="kick-modal__player"
          :key="player.userId"
          v-wave
        >
          <UserAvatar class="kick-modal__player__img" :user="player" />
          <span>
            {{ player.name }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.kick-modal {
  position: relative;
  max-width: 96vw;
  padding: 22px;
  border-radius: 12px;
  background-color: colors.$light-surface;

  &__close {
    position: absolute;
    top: 6px;
    right: 6px;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  }

  h1 {
    margin: 0;
    margin-bottom: 8px;
  }

  &__player {
    --color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    padding: 8px;

    &__img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
}
</style>
