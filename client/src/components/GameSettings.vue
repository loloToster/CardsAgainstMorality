<script setup lang="ts">
import { computed, reactive } from "vue"

import { ApiPlayer, ApiCardPack } from "@backend/types"
import { copyToClipboard } from "../utils"
import { user } from "../contexts/user"

import AppButton from "./AppButton.vue"
import AppLoader from "./AppLoader.vue"
import NumericInput from "./NumericInput.vue"
import AnimatedNumber from "./AnimatedNumber.vue"
import GamePack from "./GamePack.vue"
import UserAvatar from "./UserAvatar.vue"

import BlackCardIcon from "../assets/black-card-icon.svg?component"
import WhiteCardIcon from "../assets/white-card-icon.svg?component"

const props = defineProps<{ roomId: string; players: ApiPlayer[] }>()

const leader = computed(() => {
  return props.players.find(p => p.leader)
})

const emit = defineEmits<{
  (e: "start", packsIds: number[]): void
}>()

interface Pack extends ApiCardPack {
  selected: boolean
}

const state = reactive<{
  loading: boolean
  packs: Pack[]
}>({
  loading: true,
  packs: []
})

const selectedPacks = computed(() => {
  return [...state.packs].filter(p => p.selected)
})

const numOfWhiteCards = computed(() => {
  return selectedPacks.value.reduce((n, { numOfWhites }) => n + numOfWhites, 0)
})

const numOfBlackCards = computed(() => {
  return selectedPacks.value.reduce((n, { numOfBlacks }) => n + numOfBlacks, 0)
})

function selectAllPacks() {
  state.packs.forEach(p => (p.selected = true))
}

function unselectAllPacks() {
  state.packs.forEach(p => (p.selected = false))
}

function togglePack(packId: number) {
  state.packs = state.packs.map(p => ({
    ...p,
    selected: packId === p.id ? !p.selected : p.selected
  }))
}

fetch("/api/packs").then(async res => {
  const { packs } = await res.json()
  state.packs = packs.map((p: ApiCardPack) => ({ ...p, selected: false }))
  state.loading = false
})

function onStart() {
  emit(
    "start",
    selectedPacks.value.map(p => p.id)
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
      <div
        v-if="state.loading || !players.length"
        class="settings__panel settings__loading"
      >
        <AppLoader outline-color="#3a3a3a" />
      </div>
      <div
        v-else-if="leader?.userId !== user.value?.id"
        class="settings__panel settings__loading"
      >
        <AppLoader outline-color="#3a3a3a" />
        <h1>Waiting for room leader to start the game</h1>
      </div>
      <div v-else class="settings__panel settings__main">
        <div class="settings__main__options">
          <div class="settings__main__options-row">
            <h3>Score limit</h3>
            <NumericInput :lowest="1" :highest="20" :default-val="15" />
          </div>
          <div class="settings__main__options-row">
            <h3>Player limit</h3>
            <NumericInput :lowest="2" :highest="10" :default-val="3" />
          </div>
          <div
            class="settings__main__options-row settings__main__options-row--flex"
          >
            <h3>Card sets</h3>
            <button @click="selectAllPacks">Select all</button>
            <button @click="unselectAllPacks">Unselect all</button>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__packs">
              <GamePack
                v-for="pack in state.packs"
                @click="togglePack(pack.id)"
                :pack="pack"
                :selected="pack.selected"
                :key="pack.id"
              />
            </div>
          </div>
        </div>
        <div class="settings__main__bottom">
          <BlackCardIcon class="settings__main__bottom__icon" />
          <AnimatedNumber
            :value="numOfBlackCards"
            class="settings__main__bottom__n"
          />
          <WhiteCardIcon class="settings__main__bottom__icon" />
          <AnimatedNumber
            :value="numOfWhiteCards"
            class="settings__main__bottom__n"
          />
          <AppButton
            @click="onStart()"
            :disabled="
              !numOfBlackCards || !numOfWhiteCards || players.length < 2
            "
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
          <UserAvatar :user="player" />
          <div>
            <div class="settings__player__name">{{ player.name }}</div>
            <div v-if="player.leader" class="settings__player__leader">
              Room Leader
            </div>
          </div>
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
    flex-direction: column;
    gap: 16px;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 8px;

    h3 {
      margin: 0;
    }

    &__options {
      flex-grow: 1;
      overflow-y: auto;
    }

    &__options-row {
      margin-bottom: 8px;

      &--flex {
        display: flex;
        align-items: center;
      }

      button {
        margin-left: 8px;
        font-size: 0.7rem;
        cursor: pointer;
        color: #dfdfdf;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__bottom {
      display: flex;
      align-items: center;
      gap: 8px;

      button {
        margin-left: auto;
      }

      &__icon {
        height: 32px;
        width: 32px;
      }

      &__n {
        font-size: 1.3rem;
        min-width: 4ch;
      }
    }
  }

  &__packs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
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
      font-family: monospace;
      font-size: 1.7rem;
      text-align: center;
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

    :deep(img) {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    div {
      overflow: hidden;
    }

    &__name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__leader {
      font-size: 0.7rem;
    }
  }
}
</style>
