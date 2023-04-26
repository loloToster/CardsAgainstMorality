<script setup lang="ts">
import { useRouter } from "vue-router"

import { TITLE } from "@/consts"

import AppButton from "@/components/AppButton.vue"
import PlayingCard from "@/components/PlayingCard.vue"

const router = useRouter()

async function onRoomCreate() {
  const res = await fetch("/api/room")
  const json = await res.json()

  router.push("/room/" + json.roomId)
}
</script>

<template>
  <div class="home">
    <h1>{{ TITLE }}</h1>
    <p>
      The best online
      <a
        href="https://www.cardsagainsthumanity.com/"
        target="_blank"
        rel="noopener noreferrer"
        >Cards Against Humanity</a
      >
      experience
    </p>
    <div class="home__landing">
      <div class="home__landing__cards">
        <PlayingCard
          class="home__landing__card home__landing__card--black"
          pack=""
          color="black"
        >
          I would like to ____.
        </PlayingCard>
        <PlayingCard
          @click="onRoomCreate"
          class="home__landing__card home__landing__card--create"
          pack=""
          color="white"
        >
          Create a room.
        </PlayingCard>
        <PlayingCard
          pack=""
          color="white"
          class="home__landing__card home__landing__card--join"
        >
          Join a room.
        </PlayingCard>
      </div>
      <div class="home__stripe">
        <AppButton class="home__stripe__btn">Github</AppButton>
        <AppButton class="home__stripe__btn">About</AppButton>
        <AppButton class="home__stripe__btn">Lorem</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.home {
  h1 {
    text-align: center;
    margin: 0;
    margin-top: 8vh;
    font-size: clamp(1.2rem, 10vw, 64px);
    padding: 0 12px;
  }

  p {
    text-align: center;
    font-size: clamp(1rem, 4vw, 1.5rem);
    padding: 0 10vw;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__landing {
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
      transition: translate 100ms ease-in-out;

      &--black {
        left: 0;
      }

      &--create {
        right: 20%;
        rotate: 352deg;
        cursor: pointer;

        &:hover {
          translate: -2% -4%;
        }
      }

      &--join {
        bottom: -10%;
        right: 0;
        rotate: 9deg;
        cursor: pointer;

        &:hover {
          translate: 2% -4%;
        }
      }
    }
  }

  &__stripe {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    border-style: solid;
    border-color: colors.$darkgray;
    border-width: 1px 0;
    background-color: rgba(colors.$main-bg, 0.9);
    backdrop-filter: blur(4px);
    z-index: 1;

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
