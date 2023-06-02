<script setup lang="ts">
import { computed, reactive } from "vue"
import { RouterLink } from "vue-router"

import { ApiRoom } from "@backend/types"
import api from "@/utils/api"

import AppLoading from "@/components/AppLoading.vue"
import AppError from "@/components/AppError.vue"
import UserAvatar from "@/components/UserAvatar.vue"
import AppButton from "@/components/AppButton.vue"

const state = reactive<{
  loading: boolean
  error: boolean
  rooms: ApiRoom[]
}>({
  loading: true,
  error: false,
  rooms: []
})

api
  .get("/api/rooms")
  .then(res => {
    state.rooms = res.data.rooms
  })
  .catch(err => {
    console.error(err)
    state.error = true
  })
  .finally(() => {
    state.loading = false
  })

const rooms = computed(() => {
  return state.rooms.map(r => {
    const name = r.name ? r.name : `${r.leaderName}'s room`

    return { ...r, name }
  })
})
</script>

<template>
  <AppLoading v-if="state.loading">Loading rooms</AppLoading>
  <AppError v-else-if="state.error">
    Something went wrong while fetching rooms
  </AppError>
  <div v-else-if="state.rooms.length" class="rooms">
    <div v-for="room in rooms" class="room" :key="room.id">
      <div class="room__name">{{ room.name }}</div>
      <div class="room__code">{{ room.id }}</div>
      <div class="room__leader">
        <UserAvatar
          class="room__leader__avatar"
          :user="{ picture: room.leaderAvatar ?? undefined }"
        />
        <span class="room__leader__name">{{ room.leaderName }}</span>
      </div>
      <div class="room__players">
        <span> Players: </span>
        <span>{{ room.players }}/{{ room.maxPlayers }}</span>
      </div>
      <RouterLink :to="`/room/${room.id}`">
        <AppButton class="room__join"> Join </AppButton>
      </RouterLink>
    </div>
  </div>
  <div v-else>No rooms</div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.rooms {
  --items-in-row: 3;

  @include mixins.sm {
    --items-in-row: 2;
  }

  @include mixins.xs {
    --items-in-row: 1;
  }

  display: grid;
  grid-template-columns: repeat(var(--items-in-row), 1fr);
  grid-auto-rows: 1fr;
  gap: 2vw;
  width: 90%;
  max-width: 1100px;
  margin: 30px auto;
}

.room {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  overflow: hidden;
  border-radius: 16px;
  background-color: colors.$light-surface;

  &__name {
    font-size: 1.2rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__code {
    font-size: 0.8rem;
    color: colors.$lightgray;
    font-weight: bold;
    margin-top: -6px;
  }

  &__leader {
    display: flex;
    gap: 8px;
    align-items: center;

    &__avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
  }

  &__players {
    display: flex;
    justify-content: space-between;
  }

  &__join {
    width: 100%;

    @include colors.app-button(colors.$primary);
  }
}
</style>
