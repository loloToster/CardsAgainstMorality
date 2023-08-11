<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { onClickOutside } from "@vueuse/core"

import api from "@/utils/api"
import { SETTINGS_BOUNDARIES } from "@backend/consts"
import type { ApiCardPack, SettingsData, SettingsPack } from "@backend/types"

import { useScreenStore } from "@/contexts/screen"
import { useUserStore } from "@/contexts/user"
import { useGameStateStore } from "./contexts/gamestate"
import { useGameSettingsStore, ensureBoundary } from "./contexts/gamesettings"

import AppSwitch from "@/components/AppSwitch.vue"
import AppButton from "@/components/AppButton.vue"
import CopyButton from "@/components/CopyButton.vue"
import AppLoader from "@/components/AppLoader.vue"
import AppError from "@/components/AppError.vue"
import NumericInput from "@/components/NumericInput.vue"
import AnimatedNumber from "@/components/AnimatedNumber.vue"
import UserAvatar from "@/components/UserAvatar.vue"
import UserDetails from "@/components/UserDetails.vue"
import GamePack from "./game-components/GamePack.vue"

import BlackCardIcon from "@/assets/black-card-icon.svg?component"
import WhiteCardIcon from "@/assets/white-card-icon.svg?component"

defineProps<{ roomId: string }>()

const screen = useScreenStore()
const user = useUserStore()
const gameSettings = useGameSettingsStore()
const gameState = useGameStateStore()

const emit = defineEmits<{
  (e: "start", data: SettingsData): void
  (e: "change", data: Partial<SettingsData>): void
  (e: "kick", playerId: number): void
}>()

const PACK_GROUPS = 3

const state = reactive<{
  loading: boolean
  error: boolean
  inviteOpen: boolean
  packs: ApiCardPack[]
  fetchedPackGroups: number
}>({
  loading: true,
  error: false,
  inviteOpen: false,
  packs: [],
  fetchedPackGroups: 0
})

const invalidRoomName = computed(() => {
  return !SETTINGS_BOUNDARIES.name.matches.test(gameSettings.roomName)
})

interface SettingsApiPack extends ApiCardPack {
  blacks: boolean
  whites: boolean
}

const settingsApiPacks = computed(() => {
  const packs: SettingsApiPack[] = []

  for (const pack of state.packs) {
    const selectedPack = gameSettings.selectedPacks.find(p => p.id === pack.id)

    packs.push({
      ...pack,
      blacks: selectedPack?.blacks ?? false,
      whites: selectedPack?.whites ?? false
    })
  }

  return packs
})

const numOfWhiteCards = computed(() => {
  return settingsApiPacks.value
    .filter(p => p.whites)
    .reduce((n, { numOfWhites }) => n + numOfWhites, 0)
})

const numOfBlackCards = computed(() => {
  return settingsApiPacks.value
    .filter(p => p.blacks)
    .reduce((n, { numOfBlacks }) => n + numOfBlacks, 0)
})

function toggleAllPacks(selected: boolean) {
  if (selected) {
    gameSettings.selectedPacks = state.packs.map(p => ({
      id: p.id,
      blacks: true,
      whites: true
    }))
  } else {
    gameSettings.selectedPacks = []
  }
}

function togglePack(packId: string) {
  const newSelectedPacks: SettingsPack[] = []
  let foundPack = false

  for (const pack of gameSettings.selectedPacks) {
    if (packId !== pack.id) {
      newSelectedPacks.push(pack)
      continue
    }

    foundPack = true
  }

  if (!foundPack) {
    newSelectedPacks.push({
      id: packId,
      blacks: true,
      whites: true
    })
  }

  gameSettings.selectedPacks = newSelectedPacks

  return
}

function onlyBlacks(packId: string) {
  const pack = gameSettings.selectedPacks.find(p => p.id === packId)

  if (pack) {
    pack.blacks = true
    pack.whites = false
  } else {
    gameSettings.selectedPacks.push({
      id: packId,
      blacks: true,
      whites: false
    })
  }
}

function onlyWhites(packId: string) {
  const pack = gameSettings.selectedPacks.find(p => p.id === packId)

  if (pack) {
    pack.blacks = false
    pack.whites = true
  } else {
    gameSettings.selectedPacks.push({
      id: packId,
      blacks: false,
      whites: true
    })
  }
}

async function fetchPacks(query = "") {
  try {
    const res = await api.get("/api/packs?" + query)
    const packs: ApiCardPack[] = res.data.packs
    state.packs = state.packs.concat(
      packs.filter(fp => !state.packs.find(p => p.id === fp.id))
    )
  } catch (err) {
    console.error(err)
    state.error = true
  }

  state.fetchedPackGroups++
  if (state.fetchedPackGroups === PACK_GROUPS) {
    state.loading = false
  }
}

// todo: handle private & liked packs
fetchPacks("liked=true")
fetchPacks("author=official")
if (gameState.leader) fetchPacks(`owner=${gameState.leader.user.id}`)

watch(
  () => gameState.leader,
  () => {
    if (gameState.leader) fetchPacks(`owner=${gameState.leader.user.id}`)
  }
)

const likedPacks = computed(() => {
  return settingsApiPacks.value.filter(
    p => p.liked && p.owner?.id !== user.value?.id
  )
})

const leaderPacks = computed(() => {
  return settingsApiPacks.value.filter(
    p => p.owner && p.owner.id === gameState.leader?.user.id
  )
})

const officialPacks = computed(() => {
  return settingsApiPacks.value.filter(p => p.official && !p.liked)
})

const canStart = computed(() => {
  return (
    !invalidRoomName.value &&
    numOfBlackCards.value &&
    numOfWhiteCards.value &&
    gameState.players.length >= (SETTINGS_BOUNDARIES.playersLimit.min ?? 1) &&
    ensureBoundary(
      gameSettings.playersLimit,
      SETTINGS_BOUNDARIES.playersLimit
    ) &&
    (gameSettings.timeLimitEnabled
      ? ensureBoundary(gameSettings.timeLimit, SETTINGS_BOUNDARIES.timeLimit)
      : true) &&
    (gameSettings.scoreLimitEnabled
      ? ensureBoundary(gameSettings.scoreLimit, SETTINGS_BOUNDARIES.scoreLimit)
      : true) &&
    (gameSettings.roundLimitEnabled
      ? ensureBoundary(gameSettings.roundLimit, SETTINGS_BOUNDARIES.roundLimit)
      : true)
  )
})

function onChange() {
  if (gameState.imLeader) emit("change", gameSettings.getValidParsedSettings())
}

function onStart() {
  emit("start", gameSettings.getParsedSettings())
}

watch(gameSettings, onChange)

const windowLocation = computed(() => {
  return window.location.href
})

const invitePlayersContent = ref<HTMLDivElement>()

onClickOutside(invitePlayersContent, () => {
  state.inviteOpen = false
})
</script>
<template>
  <div class="settings">
    <div class="settings__left">
      <div v-if="state.error" class="settings__panel">
        <AppError> Something went wrong </AppError>
      </div>
      <div
        v-else-if="state.loading || !gameState.players.length"
        class="settings__panel settings__loading"
      >
        <AppLoader class="settings__loader" />
      </div>
      <div v-else class="settings__panel settings__main">
        <div class="settings__main__options">
          <div class="settings__main__options-row">
            <input
              v-model="gameSettings.roomName"
              :placeholder="gameSettings.defaultRoomName"
              :disabled="!gameState.imLeader"
              class="settings__main__room-name"
              type="text"
            />
            <div v-if="invalidRoomName" class="settings__main__room-name-err">
              The name is invalid
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <h3>Public room</h3>
              <AppSwitch
                v-model="gameSettings.public"
                :disabled="!gameState.imLeader"
              />
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.right="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <h3>Player limit</h3>
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.right="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <div class="settings__main__optional active">
              <NumericInput
                v-model="gameSettings.playersLimit"
                :lowest="SETTINGS_BOUNDARIES.playersLimit.min"
                :highest="SETTINGS_BOUNDARIES.playersLimit.max ?? Infinity"
                :disabled="!gameState.imLeader"
              />
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch
                v-model="gameSettings.timeLimitEnabled"
                :disabled="!gameState.imLeader"
              />
              <h3>Time limit</h3>
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.right="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <div
              class="settings__main__optional"
              :class="{ active: gameSettings.timeLimitEnabled }"
            >
              <NumericInput
                v-model="gameSettings.timeLimit"
                :lowest="SETTINGS_BOUNDARIES.timeLimit.min"
                :highest="SETTINGS_BOUNDARIES.timeLimit.max"
                :disabled="!gameState.imLeader"
              />
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch
                v-model="gameSettings.scoreLimitEnabled"
                :disabled="!gameState.imLeader"
              />
              <h3>Score limit</h3>
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.right="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <div
              class="settings__main__optional"
              :class="{ active: gameSettings.scoreLimitEnabled }"
            >
              <NumericInput
                v-model="gameSettings.scoreLimit"
                :lowest="SETTINGS_BOUNDARIES.scoreLimit.min"
                :highest="SETTINGS_BOUNDARIES.scoreLimit.max"
                :disabled="!gameState.imLeader"
              />
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <AppSwitch
                v-model="gameSettings.roundLimitEnabled"
                :disabled="!gameState.imLeader"
              />
              <h3>Round limit</h3>
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.right="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
            </div>
            <div
              class="settings__main__optional"
              :class="{ active: gameSettings.roundLimitEnabled }"
            >
              <NumericInput
                v-model="gameSettings.roundLimit"
                :lowest="SETTINGS_BOUNDARIES.roundLimit.min"
                :highest="SETTINGS_BOUNDARIES.roundLimit.max"
                :disabled="!gameState.imLeader"
              />
            </div>
          </div>
          <div class="settings__main__options-row">
            <div class="settings__main__option-title">
              <h3>Card sets</h3>
              <div
                class="settings__main__option-title__tooltip"
                v-tooltip.bottom="'test'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                  <path
                    d="M480 816q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555 571q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484 336q-51 0-88.5 27T343 436l65 27q9-28 28.5-43.5T482 404q28 0 46 16t18 42q0 23-15.5 41T496 538q-35 32-43.5 52.5T444 663Zm36 297q-79 0-149-30t-122.5-82.5Q156 795 126 725T96 576q0-80 30-149.5t82.5-122Q261 252 331 222t149-30q80 0 149.5 30t122 82.5Q804 357 834 426.5T864 576q0 79-30 149t-82.5 122.5Q699 900 629.5 930T480 960Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"
                  />
                </svg>
              </div>
              <button v-if="gameState.imLeader" @click="toggleAllPacks(true)">
                Select all
              </button>
              <button v-if="gameState.imLeader" @click="toggleAllPacks(false)">
                Unselect all
              </button>
            </div>
          </div>
          <div
            v-for="group in [
              { name: 'Liked packs', packs: likedPacks },
              {
                name: gameState.imLeader ? 'My packs' : 'Leader packs',
                packs: leaderPacks
              },
              { name: 'Official packs', packs: officialPacks }
            ].filter(g => g.packs.length)"
            class="settings__main__options-row"
            :key="group.name"
          >
            <h4>{{ group.name }}</h4>
            <div class="settings__packs">
              <GamePack
                v-for="pack in group.packs"
                @click="togglePack(pack.id)"
                @only-blacks="onlyBlacks(pack.id)"
                @only-whites="onlyWhites(pack.id)"
                :pack="pack"
                :selectedBlacks="pack.blacks"
                :selectedWhites="pack.whites"
                :disabled="!gameState.imLeader"
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
            v-if="gameState.imLeader"
            @click="onStart()"
            :disabled="!canStart"
            class="settings__main__bottom__right"
          >
            Start
          </AppButton>
          <div
            v-else
            class="settings__main__bottom__right settings__main__bottom__right--waiting"
          >
            Waiting for leader to start
            <span v-for="i in 3" :key="i">.</span>
          </div>
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
            <CopyButton
              :content="roomId"
              class="settings__invite__btn settings__invite__btn--code"
            >
              Code
            </CopyButton>
            <CopyButton
              :content="windowLocation"
              class="settings__invite__btn settings__invite__btn--link"
            >
              Link
            </CopyButton>
          </div>
        </div>
      </div>
      <div
        v-if="!gameState.players.length"
        class="settings__players settings__panel settings__loading"
      >
        <AppLoader class="settings__loader" />
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
        <UserDetails
          v-for="player in gameState.players"
          :user-details="player.user"
          :placement="screen.sm ? 'top' : undefined"
          :key="player.user.id"
        >
          <div class="settings__player">
            <UserAvatar :user="player.user" />
            <div>
              <div class="settings__player__name">
                {{ player.user.displayName }}
              </div>
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
          <template
            #underdetails
            v-if="gameState.imLeader && player.user.id !== user.value?.id"
          >
            <AppButton
              @click="$emit('kick', player.user.id)"
              class="settings__player__kick"
            >
              Kick
            </AppButton>
          </template>
        </UserDetails>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "sass:math" as math;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

$main-gap: 16px;
.settings {
  display: flex;
  gap: $main-gap;
  width: 90vw;
  max-width: 1100px;
  height: 80vh;
  margin: auto;
  margin-top: 5vh;

  &__loader {
    --outline: #{colors.$light-surface};
  }

  @include mixins.sm() {
    gap: 0;
    flex-direction: column;

    &__loader {
      --outline: #{colors.$main-bg};
    }
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

    @include mixins.sm() {
      flex-direction: row;
      width: 100%;
      max-width: 100%;
    }
  }

  &__panel {
    background-color: colors.$light-surface;
    width: 100%;
    height: 100%;
    border-radius: $main-gap;
    padding: 14px;

    @include mixins.sm() {
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

    @include mixins.sm() {
      padding-bottom: 12px;
    }

    h3 {
      letter-spacing: 0.5px;
    }

    &__options {
      flex-grow: 1;
      overflow-y: scroll;
    }

    &__options-row {
      margin-bottom: 8px;

      h4 {
        letter-spacing: 0.3px;
        margin-bottom: 4px;
        font-size: 0.9rem;
      }

      button {
        font-size: 0.7rem;
        cursor: pointer;
        color: colors.$subtext;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__room-name {
      width: 70%;
      padding: 8px;
      font-size: 1.6rem;
      border-radius: 4px;
      transition: background-color 200ms;

      @include mixins.sm() {
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
        background-color: colors.$inp-bg;
      }

      &:disabled {
        color: inherit;
      }
    }

    &__room-name-err {
      color: colors.$error;
      margin-top: 4px;
      font-size: 0.875rem;
    }

    &__option-title {
      display: flex;
      align-items: center;
      gap: 8px;

      &__tooltip {
        position: relative;
        top: -1px;

        svg {
          height: 16px;
          width: 16px;
          fill: currentColor;
        }
      }
    }

    &__optional {
      display: none;
      margin-top: 6px;
      margin-left: 8px;

      &.active {
        display: block;
      }
    }

    &__bottom {
      display: flex;
      align-items: center;
      gap: 8px;

      &__icon {
        height: 32px;
        width: 32px;
      }

      &__n {
        font-size: 1.3rem;
        min-width: 3ch;

        @include mixins.sm() {
          min-width: 2ch;
        }
      }

      &__right {
        margin-left: auto;

        &--waiting {
          padding-left: 6px;
          font-size: min(3.5vw, 1.1rem);
          text-align: end;

          @keyframes waiting {
            0%,
            60%,
            100% {
              transform: translateY(0);
            }

            40% {
              transform: translateY(-60%);
            }
          }

          @for $i from 1 through 3 {
            span:nth-child(#{$i}) {
              display: inline-block;
              line-height: 20%;
              animation: waiting 1100ms infinite;
              animation-delay: #{$i * 200ms};
            }
          }
        }
      }
    }
  }

  &__packs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-bottom: 0.3rem;

    @include mixins.sm() {
      justify-content: center;
    }
  }

  &__invite {
    $space: 14px;

    display: flex;
    align-items: center;
    justify-content: center;
    height: fit-content;

    @include mixins.sm() {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: colors.$modal-bg;
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

      @include mixins.sm() {
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
      border-bottom: colors.$lightgray 1px solid;
      background-color: colors.$inp-bg;
      padding: 12px;
      border-radius: 4px 4px 0 0;
    }

    &__btns {
      display: flex;
      gap: $space;
    }

    &__btn {
      flex-grow: 1;

      &--code {
        @include colors.app-button(colors.$lime);
      }

      &--link {
        @include colors.app-button(colors.$blue);
      }
    }
  }

  &__players {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;

    @include mixins.sm() {
      padding-top: 12px;
      flex-direction: row;
      border-radius: 0;
      border-top: 1px colors.$lightgray solid;
    }

    &__invite-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background-color: colors.$primary;
      border-radius: 50%;
      flex-shrink: 0;
      min-width: 0;

      @include mixins.sm() {
        display: flex;
      }

      svg {
        fill: colors.$text;
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
    padding: 3px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: colors.$darkgray;
    }

    :deep(img) {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    div {
      overflow: hidden;

      @include mixins.sm() {
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

      @include mixins.sm() {
        display: block;
      }
    }

    &__kick {
      width: 100%;
    }
  }
}
</style>
