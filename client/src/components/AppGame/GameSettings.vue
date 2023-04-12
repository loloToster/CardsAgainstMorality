<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { onClickOutside } from "@vueuse/core"

import { ApiCardPack, StartData } from "@backend/types"

import { copyToClipboard } from "../../utils"

import { user } from "../../contexts/user"
import { gameState } from "./contexts/gamestate"

import AppSwitch from "../AppSwitch.vue"
import AppTooltip from "../AppTooltip.vue"
import AppButton from "../AppButton.vue"
import AppLoader from "../AppLoader.vue"
import NumericInput from "../NumericInput.vue"
import AnimatedNumber from "../AnimatedNumber.vue"
import UserAvatar from "../UserAvatar.vue"
import GamePack from "./game-components/GamePack.vue"

import BlackCardIcon from "../../assets/black-card-icon.svg?component"
import WhiteCardIcon from "../../assets/white-card-icon.svg?component"

const props = defineProps<{ roomId: string }>()

const leader = computed(() => {
  return gameState.players.find(p => p.leader)
})

const emit = defineEmits<{
  (e: "start", data: StartData): void
}>()

interface Pack extends ApiCardPack {
  selected: boolean
}

const state = reactive<{
  loading: boolean
  inviteOpen: boolean
  roomName: string
  playerLimit: number
  timeLimitEnabled: boolean
  timeLimit: number
  scoreLimitEnabled: boolean
  scoreLimit: number
  roundLimitEnabled: boolean
  roundLimit: number
  packs: Pack[]
}>({
  loading: true,
  inviteOpen: false,
  roomName: "",
  playerLimit: 10,
  timeLimitEnabled: false,
  timeLimit: 120,
  scoreLimitEnabled: false,
  scoreLimit: 15,
  roundLimitEnabled: false,
  roundLimit: 30,
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
  emit("start", {
    playersLimit: state.playerLimit,
    timeLimit: state.timeLimitEnabled ? state.timeLimit : null,
    scoreLimit: state.scoreLimitEnabled ? state.scoreLimit : null,
    roundLimit: state.roundLimitEnabled ? state.roundLimit : null,
    packs: selectedPacks.value.map(p => p.id)
  })
}

function onCopyCode() {
  copyToClipboard(props.roomId)
}

function onCopyLink() {
  copyToClipboard(window.location.href)
}

const invitePlayersContent = ref<HTMLDivElement>()

onClickOutside(invitePlayersContent, () => {
  state.inviteOpen = false
})
</script>
<template>
  <div class="settings">
    <div class="settings__left">
      <div
        v-if="state.loading || !gameState.players.length"
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
            <input
              v-model="state.roomName"
              placeholder="User's Room"
              class="settings__main__room-name"
              type="text"
            />
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <h3>Player limit</h3>
              <div class="settings__main__option-title__tooltip">
                <AppTooltip
                  class="settings__main__option-title__tooltip__box"
                  position="right"
                >
                  test
                </AppTooltip>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <NumericInput
              v-model="state.playerLimit"
              :lowest="2"
              :highest="21"
              class="settings__main__optional"
            />
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch @new-value="v => (state.timeLimitEnabled = v)" />
              <h3>Time limit</h3>
              <div class="settings__main__option-title__tooltip">
                <AppTooltip
                  class="settings__main__option-title__tooltip__box"
                  position="right"
                >
                  test
                </AppTooltip>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <NumericInput
              v-if="state.timeLimitEnabled"
              v-model="state.timeLimit"
              :lowest="5"
              :highest="360"
              class="settings__main__optional"
            />
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch @new-value="v => (state.scoreLimitEnabled = v)" />
              <h3>Score limit</h3>
              <div class="settings__main__option-title__tooltip">
                <AppTooltip
                  class="settings__main__option-title__tooltip__box"
                  position="right"
                >
                  test
                </AppTooltip>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <NumericInput
              v-if="state.scoreLimitEnabled"
              v-model="state.scoreLimit"
              :lowest="0"
              :highest="Infinity"
              class="settings__main__optional"
            />
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch @new-value="v => (state.roundLimitEnabled = v)" />
              <h3>Round limit</h3>
              <div class="settings__main__option-title__tooltip">
                <AppTooltip
                  class="settings__main__option-title__tooltip__box"
                  position="right"
                >
                  test
                </AppTooltip>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <NumericInput
              v-if="state.roundLimitEnabled"
              v-model="state.roundLimit"
              :lowest="0"
              :highest="Infinity"
              class="settings__main__optional"
            />
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <h3>Card sets</h3>
              <div class="settings__main__option-title__tooltip">
                <AppTooltip
                  class="settings__main__option-title__tooltip__box"
                  position="right"
                >
                  test
                </AppTooltip>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
              <button @click="selectAllPacks">Select all</button>
              <button @click="unselectAllPacks">Unselect all</button>
            </div>
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
              !numOfBlackCards ||
              !numOfWhiteCards ||
              gameState.players.length < 2
            "
          >
            Start
          </AppButton>
        </div>
      </div>
    </div>
    <div class="settings__right">
      <div
        class="settings__invite settings__panel"
        :class="{ active: state.inviteOpen }"
      >
        <div ref="invitePlayersContent" class="settings__invite__content">
          <button
            @click="state.inviteOpen = false"
            class="settings__invite__close"
            v-wave
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
              <path
                d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
              />
            </svg>
          </button>
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
      </div>
      <div
        v-if="!gameState.players.length"
        class="settings__players settings__panel settings__loading"
      >
        <AppLoader outline-color="#3a3a3a" />
      </div>
      <div v-else class="settings__players settings__panel">
        <button
          @click="state.inviteOpen = true"
          class="settings__players__invite-btn"
          v-wave
        >
          <svg viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path>
          </svg>
        </button>
        <div
          v-for="player in gameState.players"
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
          <svg
            v-if="player.leader"
            class="settings__player__leader-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 96 960 960"
          >
            <path
              d="m243 960 63-266L96 515l276-24 108-251 108 252 276 23-210 179 63 266-237-141-237 141Z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "sass:math" as math;

@mixin mobile {
  @media (max-width: 980px) {
    @content;
  }
}

$main-gap: 16px;
.settings {
  display: flex;
  gap: $main-gap;
  width: 90vw;
  max-width: 1100px;
  height: 80vh;
  margin: auto;

  @include mobile() {
    gap: 0;
    flex-direction: column;
  }

  &__left {
    height: 100%;
    min-height: 0;
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

    @include mobile() {
      flex-direction: row;
      width: 100%;
      max-width: 100%;
    }
  }

  &__panel {
    background-color: #3a3a3a;
    width: 100%;
    height: 100%;
    border-radius: $main-gap;
    padding: 14px;

    @include mobile() {
      padding: 6px;
      background-color: transparent;
      border-radius: 0;
    }
  }

  &__loading {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 8px;

    @include mobile() {
      padding-bottom: 12px;
    }

    h3 {
      margin: 0;
      letter-spacing: 0.5px;
    }

    &__options {
      flex-grow: 1;
      overflow-y: scroll;
    }

    &__options-row {
      margin-bottom: 8px;

      button {
        font-size: 0.7rem;
        cursor: pointer;
        color: #dfdfdf;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__room-name {
      width: 45%;
      padding: 8px;
      font-size: 1.6rem;
      border-radius: 4px;
      transition: background-color 200ms;

      @include mobile() {
        width: 100%;
      }

      &::placeholder {
        color: inherit;
        transition: color 200ms;
      }

      &:focus::placeholder {
        color: #757575;
      }

      &:focus {
        background-color: #2f2f2f;
      }
    }

    &__option-title {
      display: flex;
      align-items: center;
      gap: 8px;

      &__tooltip {
        position: relative;
        top: -1px;

        &__box {
          display: none;
        }

        &:hover &__box {
          display: block;
        }

        svg {
          height: 16px;
          width: 16px;
          fill: currentColor;
        }
      }
    }

    &__optional {
      margin-top: 6px;
      margin-left: 8px;
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
        min-width: 3ch;

        @include mobile() {
          min-width: 2ch;
        }
      }
    }
  }

  &__packs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    @include mobile() {
      justify-content: center;
    }
  }

  &__invite {
    $space: 14px;

    display: flex;
    align-items: center;
    justify-content: center;
    height: fit-content;

    @include mobile() {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: #080808e3;
      z-index: 1;

      &.active {
        display: flex;
      }
    }

    &__content {
      position: relative;
      max-width: 80vw;
    }

    &__close {
      display: none;
      position: absolute;
      top: 0;
      right: -4px;
      padding: 4px;
      border-radius: 50%;

      @include mobile() {
        display: block;
      }

      svg {
        width: 20px;
        height: 20px;
        fill: #929292;
      }
    }

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
    display: flex;
    flex-direction: column;
    gap: 6px;

    @include mobile() {
      padding-top: 12px;
      flex-direction: row;
      border-radius: 0;
      border-top: 1px gray solid;
    }

    &__invite-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background-color: darkcyan;
      border-radius: 50%;

      @include mobile() {
        display: flex;
      }

      svg {
        fill: currentColor;
        width: 20px;
        height: 20px;
      }
    }
  }

  &__player {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;

    :deep(img) {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    div {
      overflow: hidden;

      @include mobile() {
        display: none;
      }
    }

    &__name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__leader {
      font-size: 0.7rem;
    }

    &__leader-icon {
      display: none;
      position: absolute;
      bottom: -3px;
      right: -6px;
      width: 22px;
      height: 22px;
      fill: goldenrod;

      @include mobile() {
        display: block;
      }
    }
  }
}
</style>
