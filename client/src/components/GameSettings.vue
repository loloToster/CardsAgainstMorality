<script setup lang="ts">
import { computed, reactive } from "vue"

import { ApiPlayer, ApiCardPack } from "@backend/types"
import { moveItem, copyToClipboard } from "../utils"

import AppButton from "./AppButton.vue"
import AppLoader from "./AppLoader.vue"
import GamePack from "./GamePack.vue"

const props = defineProps<{ roomId: string; players: ApiPlayer[] }>()

const emit = defineEmits<{
  (e: "start", packsIds: number[]): void
}>()

const state = reactive<{
  loading: boolean
  unselectedPacks: ApiCardPack[]
  selectedPacks: ApiCardPack[]
}>({
  loading: true,
  unselectedPacks: [],
  selectedPacks: []
})

const sortedUnselectedPacks = computed(() => {
  return [...state.unselectedPacks].sort((a, b) => a.id - b.id)
})

const sortedSelectedPacks = computed(() => {
  return [...state.selectedPacks].sort((a, b) => a.id - b.id)
})

function selectPack(packId: number) {
  moveItem(state.unselectedPacks, state.selectedPacks, p => p.id === packId)
}

function unselectPack(packId: number) {
  moveItem(state.selectedPacks, state.unselectedPacks, p => p.id === packId)
}

fetch("/api/packs").then(async res => {
  const { packs } = await res.json()
  state.unselectedPacks = packs
  state.loading = false
})

function onStart() {
  emit(
    "start",
    state.selectedPacks.map(p => p.id)
  )
}

function onCopyCode() {
  copyToClipboard(props.roomId)
}

function onCopyLink() {
  copyToClipboard(window.location.href)
}
</script>
<template>
  <div class="settings">
    <div class="settings__left">
      <div v-if="state.loading" class="settings__panel settings__loading">
        <AppLoader outline-color="#3a3a3a" />
      </div>
      <div v-else class="settings__panel settings__main">
        <div class="settings__main__options">
          <h3>Select packs that you want to use:</h3>
          <div class="settings__packs">
            <GamePack
              v-for="pack in sortedUnselectedPacks"
              @click="selectPack(pack.id)"
              :pack="pack"
              :key="pack.id"
            />
          </div>
          <h3>Selected packs:</h3>
          <div class="settings__packs">
            <GamePack
              v-for="pack in sortedSelectedPacks"
              @click="unselectPack(pack.id)"
              :pack="pack"
              closable
              :key="pack.id"
            />
          </div>
        </div>
        <div class="settings__main__btns">
          <AppButton
            @click="onStart()"
            :disabled="!state.selectedPacks.length || players.length < 2"
          >
            Start
          </AppButton>
        </div>
      </div>
    </div>
    <div class="settings__right">
      <div class="settings__invite settings__panel">
        <h2>Invite Players</h2>
        <h5>Room code:</h5>
        <input
          class="settings__invite__code"
          type="text"
          readonly
          :value="roomId"
          @click="e => (e.target as HTMLInputElement).select()"
        />
        <div class="settings__invite__btns">
          <AppButton
            @click="onCopyCode"
            color="#15b041"
            class="settings__invite__btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
              <path
                d="M200 976q-33 0-56.5-23.5T120 896V336h80v560h440v80H200Zm160-160q-33 0-56.5-23.5T280 736V256q0-33 23.5-56.5T360 176h360q33 0 56.5 23.5T800 256v480q0 33-23.5 56.5T720 816H360Zm0-80h360V256H360v480Zm0 0V256v480Z"
              />
            </svg>
            <div>Code</div>
          </AppButton>
          <AppButton
            color="#1869cc"
            @click="onCopyLink"
            class="settings__invite__btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
              <path
                d="M200 976q-33 0-56.5-23.5T120 896V336h80v560h440v80H200Zm160-160q-33 0-56.5-23.5T280 736V256q0-33 23.5-56.5T360 176h360q33 0 56.5 23.5T800 256v480q0 33-23.5 56.5T720 816H360Zm0-80h360V256H360v480Zm0 0V256v480Z"
              />
            </svg>
            <div>Link</div>
          </AppButton>
        </div>
      </div>
      <div
        v-if="!players.length"
        class="settings__players settings__panel settings__loading"
      >
        <AppLoader outline-color="#3a3a3a" />
      </div>
      <div v-else class="settings__players settings__panel">
        <div
          v-for="player in players"
          :key="player.name"
          class="settings__player"
        >
          <img :src="player.picture" />
          <span>{{ player.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "sass:math" as math;

$main-gap: 16px;
.settings {
  display: flex;
  gap: $main-gap;
  width: 90vw;
  max-width: 1100px;
  height: 80vh;
  margin: auto;

  &__left {
    height: 100%;
    flex-grow: 1;
    flex-basis: 0;
  }

  &__right {
    display: flex;
    flex-direction: column;
    gap: $main-gap;
    width: 20vw;
    max-width: 300px;
    min-width: 250px;
  }

  &__panel {
    background-color: #3a3a3a;
    width: 100%;
    height: 100%;
    border-radius: $main-gap;
    padding: 14px;
  }

  &__loading {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__main {
    display: flex;
    flex-direction: column;

    h3 {
      margin: 0;
      margin-bottom: 8px;
    }

    &__options {
      flex-grow: 1;
    }

    &__btns {
      display: flex;
      gap: 8px;

      & > *:first-child {
        margin-left: auto;
      }
    }
  }

  &__packs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  &__invite {
    $space: 14px;

    height: fit-content;

    h2,
    h5 {
      margin: 0;
      margin-bottom: math.div($space, 2);
    }

    &__code {
      margin-bottom: $space;
      width: 100%;
      font-size: 1.3rem;
      outline: none;
      border: none;
      border-bottom: gray 1px solid;
      background-color: #2f2f2f;
      padding: 12px;
      border-radius: 4px 4px 0 0;
    }

    &__btns {
      display: flex;
      gap: $space;
    }

    &__btn {
      flex-grow: 1;
      display: flex;
      align-items: center;
      padding: 8px;

      svg {
        fill: currentColor;
        height: 20px;
        width: 20px;
      }

      div {
        flex-grow: 1;
        font-size: 1rem;
      }
    }
  }

  &__players {
    flex-grow: 1;
    overflow-y: auto;
  }

  &__player {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;

    &:last-child {
      padding-bottom: 0;
    }

    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
