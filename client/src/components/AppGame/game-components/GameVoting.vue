<script setup lang="ts">
import { reactive, computed, watch, onMounted, onUnmounted } from "vue"
import { VotingData } from "@backend/types"
import AppButton from "../../AppButton.vue"

const INTERVAL = 1000

const props = defineProps<{ votingData: VotingData }>()

const emit = defineEmits<{
  (e: "vote", vote: boolean): void
  (e: "counter-end"): void
}>()

const state = reactive({ active: false, counter: props.votingData.endsInMs })

let timeout: number | undefined

function countdown() {
  clearTimeout(timeout)
  if (state.counter <= 0) {
    emit("counter-end")
    return
  }

  state.counter -= INTERVAL

  timeout = setTimeout(countdown, INTERVAL) as unknown as number
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

const endsInSeconds = computed(() => {
  return Math.round(state.counter / INTERVAL)
})

const description = computed(() => {
  switch (props.votingData.voting.type) {
    case "end": {
      return "End the game"
    }

    case "kick": {
      return "Kick player:" // todo add player name
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
      <div class="voting__top">
        <div class="voting__by">Vote by: {{ votingData.by }}</div>
        <div class="voting__time">{{ endsInSeconds }}</div>
      </div>
      <div class="voting__bottom">
        <div class="voting__data">
          <div class="voting__desc">{{ description }}</div>
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
            <AppButton @click="$emit('vote', true)" color="#15b041">
              YES
            </AppButton>
            <AppButton @click="$emit('vote', false)" color="crimson">
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
      <AppButton @click="state.active = !state.active" color="transparent">
        {{ state.active ? "Hide" : "Vote" }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
$green: #15b041;
$red: crimson;

@mixin mobile {
  @media (max-width: 900px) {
    @content;
  }
}

.voting {
  position: fixed;
  top: 20%;
  left: 8px;
  width: 15vw;
  max-width: 250px;
  z-index: 3;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1c1c1c;

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

    button {
      color: #06a6d6;
    }
  }

  &__main {
    overflow: hidden;
    transition: max-height 200ms;
  }

  @include mobile() {
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
    background-color: #4a4a4a;
  }

  &__by {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    white-space: nowrap;
  }

  &__time {
    color: #9a9a9a;
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
  }

  &__state {
    &__n {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.3rem;

      &--yes {
        color: $green;
        margin-bottom: 2px;
      }

      &--no {
        color: $red;
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
          color: $green;
        }
        &.no {
          color: $red;
        }
      }
    }
  }

  &__btns {
    display: flex;
    gap: 9px;

    button {
      min-width: 0;
      flex-basis: 0;
      flex-grow: 1;
    }
  }
}
</style>
