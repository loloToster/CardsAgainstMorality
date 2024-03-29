<script setup lang="ts">
import { computed, reactive } from "vue"
import { useHead } from "@unhead/vue"
import { RouterLink } from "vue-router"
import { Tooltip } from "floating-vue"

import type { ApiRoom } from "@backend/types"
import api from "@/utils/api"

import AppLoading from "@/components/AppLoading.vue"
import AppError from "@/components/AppError.vue"
import UserAvatar from "@/components/UserAvatar.vue"
import AppButton from "@/components/AppButton.vue"

useHead({ title: "Rooms" })

const MAX_PACKS = 6

const state = reactive<{
  loading: boolean
  error: boolean
  rooms: ApiRoom[]
}>({
  loading: true,
  error: false,
  rooms: []
})

async function fetchRooms(showActivity = false) {
  state.loading = true
  state.error = false

  if (showActivity) await new Promise(r => setTimeout(r, 1000))

  try {
    const res = await api.get("/api/rooms")
    state.rooms = res.data.rooms
  } catch (err) {
    console.error(err)
    state.error = true
  } finally {
    state.loading = false
  }
}

fetchRooms()

const rooms = computed(() => {
  return state.rooms.map(r => {
    const name = r.name ? r.name : `${r.leader.displayName}'s room`

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
      <div class="room__top">
        <h2 class="room__name">{{ room.name }}</h2>
        <div
          class="room__state"
          :class="{ 'room__state--started': room.started }"
        >
          {{ room.started ? "Started" : "Not Started" }}
        </div>
      </div>
      <div class="room__code">{{ room.id }}</div>
      <div class="room__players-header">
        <h3>Players:</h3>
        <!-- add leader -->
        <span>{{ room.players.length + 1 }}/{{ room.maxPlayers }}</span>
      </div>
      <div class="room__players">
        <UserAvatar
          class="room__players__leader-avatar"
          :user="{ picture: room.leader.picture ?? undefined }"
        />
        <span class="room__players__leader-name">
          {{ room.leader.displayName }}
        </span>
        <span v-if="room.players.length"> • {{ room.players.join(", ") }}</span>
      </div>
      <div v-if="room.packs.length" class="room__packs-header">
        <h3>Cards:</h3>
      </div>
      <div v-if="room.packs.length" class="room__packs">
        <span>{{ room.packs.slice(0, MAX_PACKS).join(", ") }}</span>
        <span v-if="room.packs.length > MAX_PACKS" class="room__packs__plus">
          +
        </span>
        <Tooltip
          v-if="room.packs.length > MAX_PACKS"
          placement="bottom"
          class="room__packs__more"
        >
          <span>{{ room.packs.length - MAX_PACKS }} packs </span>
          <template #popper>
            <ul class="room__packs__overflow">
              <li v-for="pack in room.packs.slice(MAX_PACKS)" :key="pack">
                {{ pack }}
              </li>
            </ul>
          </template>
        </Tooltip>
      </div>
      <RouterLink class="room__btn-wrapper" :to="`/room/${room.id}`">
        <AppButton v-if="room.rejoin" class="room__btn room__btn--rejoin">
          Rejoin
        </AppButton>
        <AppButton v-else class="room__btn room__btn--join"> Join </AppButton>
      </RouterLink>
    </div>
  </div>
  <div v-else class="no-room">
    <svg viewBox="0 0 24 24">
      <path
        d="M2,5.27L3.28,4L20,20.72L18.73,22L12.73,16H7.97L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.1,9.09 3.53,8.17 4.19,7.46L2,5.27M5,10V11H7V13H8V11.27L6.73,10H5M16.5,6C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75C22,18.41 21.64,19 21.1,19.28L7.82,6H16.5M16.5,8A0.75,0.75 0 0,0 15.75,8.75A0.75,0.75 0 0,0 16.5,9.5A0.75,0.75 0 0,0 17.25,8.75A0.75,0.75 0 0,0 16.5,8M14.75,9.75A0.75,0.75 0 0,0 14,10.5A0.75,0.75 0 0,0 14.75,11.25A0.75,0.75 0 0,0 15.5,10.5A0.75,0.75 0 0,0 14.75,9.75M18.25,9.75A0.75,0.75 0 0,0 17.5,10.5A0.75,0.75 0 0,0 18.25,11.25A0.75,0.75 0 0,0 19,10.5A0.75,0.75 0 0,0 18.25,9.75M16.5,11.5A0.75,0.75 0 0,0 15.75,12.25A0.75,0.75 0 0,0 16.5,13A0.75,0.75 0 0,0 17.25,12.25A0.75,0.75 0 0,0 16.5,11.5Z"
      ></path>
    </svg>
    <h1>No rooms are currently public</h1>
    <button @click="fetchRooms(true)" class="no-room__refresh">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path
          d="M480-160q-133 0-226.5-93.5T160-480q0-133 93.5-226.5T480-800q85 0 149 34.5T740-671v-129h60v254H546v-60h168q-38-60-97-97t-137-37q-109 0-184.5 75.5T220-480q0 109 75.5 184.5T480-220q83 0 152-47.5T728-393h62q-29 105-115 169t-195 64Z"
        />
      </svg>
      <span>Refresh</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.rooms {
  --items-in-row: 3;

  @include mixins.md {
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
  max-width: 1200px;
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

  h3 {
    font-size: 1rem;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
  }

  &__name {
    font-size: 1.2rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__state {
    color: colors.$error;
    font-size: 0.875rem;
    font-weight: bold;
    white-space: nowrap;

    &--started {
      color: colors.$green;
    }
  }

  &__code {
    font-size: 0.8rem;
    color: colors.$lightgray;
    font-weight: bold;
    margin-top: -6px;
  }

  &__players {
    &__leader-avatar {
      margin-right: 0.7ch;
      margin-bottom: 2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
  }

  &__players-header {
    display: flex;
    justify-content: space-between;
  }

  &__packs {
    &__plus {
      cursor: default;
      font-weight: bold;
    }

    &__more {
      display: inline;
      cursor: default;
      font-weight: bold;
    }
  }

  &__btn-wrapper {
    margin-top: auto;
  }

  &__btn {
    width: 100%;

    &--rejoin {
      @include colors.app-button(colors.$green);
    }

    &--join {
      @include colors.app-button(colors.$primary);
    }
  }
}

.no-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 20px;
  margin-top: 10vh;

  svg {
    $size: 20vw;
    $max-size: 168px;

    width: $size;
    height: $size;
    max-width: $max-size;
    max-height: $max-size;
    fill: currentColor;
  }

  h1 {
    margin-top: 16px;
    margin-bottom: 4px;
    font-size: clamp(1.4rem, 7vw, 2.4rem);
  }

  &__refresh {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    svg {
      fill: currentColor;
      width: 1rem;
      height: 1rem;
    }
  }
}
</style>
