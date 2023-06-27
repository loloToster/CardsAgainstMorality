<script setup lang="ts">
import { reactive, ref, nextTick } from "vue"
import { useRouter } from "vue-router"

import { TITLE } from "@/consts"

import PlayingCard from "@/components/PlayingCard.vue"
import AppButton from "@/components/AppButton.vue"
import AppModal from "@/components/AppModal.vue"

const router = useRouter()

const state = reactive({
  joinModalCode: "",
  joinRoomModalActive: false
})

function handleJoinOpen() {
  state.joinRoomModalActive = true
  nextTick(() => {
    joinInput.value?.focus()
  })
}

const joinInput = ref<HTMLInputElement>()

function handleJoin(e: MouseEvent | KeyboardEvent) {
  if (e.type === "keypress" && (e as KeyboardEvent).key !== "Enter") return

  let roomId = state.joinModalCode

  if (roomId.includes("/")) {
    roomId = roomId.split("?")[0]
    roomId =
      roomId
        .split("/")
        .filter(s => s)
        .at(-1) ?? roomId
  }

  router.push(`/room/${roomId}`)
}
</script>

<template>
  <AppModal
    v-if="state.joinRoomModalActive"
    @close="state.joinRoomModalActive = false"
    title="Join a room"
  >
    <div class="join">
      <input
        v-model="state.joinModalCode"
        @keypress="handleJoin"
        ref="joinInput"
        placeholder="Insert Code or Link here"
        type="text"
      />
      <AppButton
        @click="handleJoin"
        :disabled="!state.joinModalCode"
        class="join__btn"
      >
        Join
      </AppButton>
    </div>
  </AppModal>
  <div class="landing">
    <div class="landing__cards">
      <PlayingCard
        class="landing__card landing__card--black"
        :pack="TITLE"
        color="black"
      >
        I would like to ____.
      </PlayingCard>
      <RouterLink to="/room">
        <PlayingCard
          class="landing__card landing__card--create"
          :pack="TITLE"
          color="white"
        >
          Create a room.
        </PlayingCard>
      </RouterLink>
      <PlayingCard
        @click="handleJoinOpen"
        :pack="TITLE"
        color="white"
        class="landing__card landing__card--join"
      >
        Join a room.
      </PlayingCard>
    </div>
    <div class="landing__stripe">
      <a
        href="http://github.com/loloToster/CardsAgainstMorality"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AppButton class="landing__stripe__btn">Github</AppButton>
      </a>
      <a href="#about">
        <AppButton class="landing__stripe__btn">About</AppButton>
      </a>
      <AppButton class="landing__stripe__btn">Lorem</AppButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.join {
  input {
    margin-bottom: 20px;
    width: 100%;
    font-size: 1.2rem;
    border-bottom: colors.$lightgray 2px solid;
    background-color: colors.$inp-bg;
    padding: 12px;
    border-radius: 4px 4px 0 0;
  }

  &__btn {
    width: 100%;
    @include colors.app-button(colors.$primary);
  }
}

.landing {
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: end;
  position: relative;
  height: 45vh;
  overflow: hidden;

  &__cards {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -20%;
    width: 870px;
    max-width: 82vw;
    height: 100%;
  }

  &__card {
    position: absolute;
    bottom: 0;
    --w: 28vh;
    transition: all 100ms ease-in-out;

    &--black {
      left: 0;

      @include mixins.sm {
        left: 50%;
        bottom: 23%;
        transform: translateX(-50%);
      }
    }

    &--create {
      right: 20%;
      transform: rotate(352deg);
      cursor: pointer;

      &:hover {
        translate: -2% -4%;
      }

      @include mixins.sm {
        right: unset;
        left: 40%;
        bottom: 0;
        transform: translateX(-50%) rotate(352deg);
      }
    }

    &--join {
      bottom: -10%;
      right: 0;
      transform: rotate(9deg);
      cursor: pointer;

      &:hover {
        translate: 2% -4%;
      }

      @include mixins.sm {
        right: unset;
        left: 60%;
        bottom: -23%;
        transform: translateX(-50%) rotate(9deg);
      }
    }
  }

  &__stripe {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    background-color: rgba(colors.$main-bg, 0.9);
    backdrop-filter: blur(4px);
    z-index: 1;

    @include mixins.section-border();

    &__btn {
      --color: transparent;
      --h-color: transparent;
      font-size: 1rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
