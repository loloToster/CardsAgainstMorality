<script setup lang="ts">
import { computed } from "vue"

import { useUserStore } from "@/contexts/user"

import type { ApiPlayer } from "@backend/types"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"
import UserAvatar from "@/components/UserAvatar.vue"

const props = defineProps<{ players: ApiPlayer[] }>()

defineEmits<{
  (ev: "close"): void
  (ev: "kick", playerId: number): void
}>()

const user = useUserStore()

const filteredPlayers = computed(() => {
  return props.players.filter(p => p.user.id !== user.value?.id)
})
</script>

<template>
  <AppModal @close="$emit('close')" title="Kick a player">
    <AppButton
      v-for="player in filteredPlayers"
      @click="$emit('kick', player.user.id)"
      class="kick-modal-player"
      :key="player.user.id"
      v-wave
    >
      <UserAvatar class="kick-modal-player__img" :user="player.user" />
      <span>
        {{ player.user.displayName }}
      </span>
    </AppButton>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.kick-modal-player {
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
</style>
