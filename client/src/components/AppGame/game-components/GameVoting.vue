<script setup lang="ts">
import { reactive, computed, watch, onMounted, onUnmounted } from "vue"
import type { VotingData, ApiPlayer } from "@backend/types"
import AppButton from "@/components/AppButton.vue"

const INTERVAL = 1000

const props = defineProps<{ votingData: VotingData; players: ApiPlayer[] }>()

const emit = defineEmits<{
  (ev: "vote", vote: boolean): void
  (ev: "counter-end"): void
}>()

const state = reactive({ active: false, counter: props.votingData.endsInMs })

let timeout: ReturnType<typeof setTimeout> | undefined

function countdown() {
  clearTimeout(timeout)
  if (state.counter <= 0) {
    emit("counter-end")
    return
  }

  state.counter -= INTERVAL

  timeout = setTimeout(countdown, INTERVAL)
}

watch(
  () => props.votingData.endsInMs,
  () => {
    state.counter = props.votingData.endsInMs
    countdown()
  }
)

onMounted(countdown)
onUnmounted(() => clearTimeout(timeout))

const voteBy = computed(() => {
  return `Vote by: ${props.votingData.by}`
})

const endsInSeconds = computed(() => {
  return Math.round(state.counter / INTERVAL)
})

const description = computed(() => {
  switch (props.votingData.voting.type) {
    case "end": {
      return "End the game"
    }

    case "kick": {
      const playerId = props.votingData.voting.playerId
      const playerName =
        props.players.find(p => p.userId === playerId)?.name || "Unknown"

      return `Kick player: ${playerName}`
    }

    default: {
      return ""
    }
  }
})
</script>

<template>
  <div class="voting">
    <div class="voting__main" :class="{ active: state.active }">
      <div class="voting__top" :title="voteBy">
        <div class="voting__by">{{ voteBy }}</div>
        <div class="voting__time">{{ endsInSeconds }}</div>
      </div>
      <div class="voting__bottom">
        <div class="voting__data">
          <div class="voting__desc" :title="description">{{ description }}</div>
          <div class="voting__state">
            <div class="voting__state__n voting__state__n--yes">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                <path
                  d="m424 760 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Z"
                />
              </svg>
              <span>{{ votingData.for }}</span>
            </div>
            <div class="voting__state__n voting__state__n--no">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                <path
                  d="m336 776 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56Zm144 200q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Z"
                />
              </svg>
              <span>{{ votingData.against }}</span>
            </div>
          </div>
        </div>
        <div class="voting__vote">
          <div v-if="votingData.vote === null" class="voting__btns">
            <AppButton
              @click="$emit('vote', true)"
              class="voting__btns__btn voting__btns__btn--yes"
            >
              YES
            </AppButton>
            <AppButton
              @click="$emit('vote', false)"
              class="voting__btns__btn voting__btns__btn--no"
            >
              NO
            </AppButton>
          </div>
          <span v-else class="voting__vote__my-vote">
            You voted:
            <span :class="votingData.vote ? 'yes' : 'no'">{{
              votingData.vote ? "YES" : "NO"
            }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="voting__mobile">
      <div class="voting__mobile__by" :class="{ active: !state.active }">
        Vote by: {{ votingData.by }}
      </div>
      <AppButton
        @click="state.active = !state.active"
        class="voting__mobile__open"
      >
        {{ state.active ? "Hide" : "Vote" }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.voting {
  position: fixed;
  top: 20%;
  left: 8px;
  width: 15vw;
  max-width: 250px;
  z-index: 3;
  border-radius: 8px;
  overflow: hidden;
  background-color: colors.$dark-surface;

  &__mobile {
    display: none;
    padding: 4px;
    padding-left: 12px;
    align-items: center;

    &__by {
      margin-right: auto;
      opacity: 0;
      transition: opacity 200ms;

      &.active {
        opacity: 1;
      }
    }

    &__open {
      color: colors.$blue;
      --color: transparent;
      --h-color: transparent;
    }
  }

  &__main {
    overflow: hidden;
    transition: max-height 200ms;
  }

  @include mixins.sm {
    height: fit-content;
    max-width: unset;
    width: calc(100vw - 16px);
    top: unset;
    bottom: 60px;

    &__main {
      max-height: 0;

      &.active {
        max-height: 100vh;
      }
    }

    &__mobile {
      display: flex;
    }
  }

  &__top {
    display: flex;
    gap: 4px;
    padding: 9px;
    background-color: colors.$darkgray;
  }

  &__by {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    white-space: nowrap;
  }

  &__time {
    color: colors.$lightgray;
    font-size: 0.9rem;
  }

  &__bottom {
    padding: 9px;
  }

  &__data {
    display: flex;
    min-height: 64px;
  }

  &__desc {
    margin-right: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__state {
    &__n {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.3rem;

      &--yes {
        color: colors.$lime;
        margin-bottom: 2px;
      }

      &--no {
        color: colors.$danger;
      }

      svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
    }
  }

  &__vote {
    margin-top: 9px;

    &__my-vote {
      display: block;
      width: 100%;
      text-align: right;
      font-size: 1.1rem;

      span {
        &.yes {
          color: colors.$lime;
        }
        &.no {
          color: colors.$danger;
        }
      }
    }
  }

  &__btns {
    display: flex;
    gap: 9px;

    &__btn {
      min-width: 0;
      flex-basis: 0;
      flex-grow: 1;

      &--yes {
        @include colors.app-button(colors.$lime);
      }

      &--no {
        @include colors.app-button(colors.$danger);
      }
    }
  }
}
</style>
