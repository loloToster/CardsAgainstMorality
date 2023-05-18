<script setup lang="ts">
import { computed, reactive } from "vue"

import { TITLE } from "@/consts"

import type { ApiCardPack } from "@backend/types"

import AppButton from "@/components/AppButton.vue"
import PlayingCard from "@/components/PlayingCard.vue"

const state = reactive<{ packs: ApiCardPack[] }>({
  packs: []
})

fetch("/api/packs").then(async res => {
  if (res.ok) {
    const { packs } = await res.json()
    state.packs = packs
  }
})

const NUM_OF_CIRCLE_ITEMS = 16

const circlePacks = computed(() => {
  return state.packs
    .filter(p => p.icon && p.color)
    .slice(0, NUM_OF_CIRCLE_ITEMS)
    .sort(() => Math.random() - Math.random())
})
</script>

<template>
  <div class="home">
    <h1>{{ TITLE }}</h1>
    <p class="home__brief">
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
        <RouterLink to="/room">
          <PlayingCard
            class="home__landing__card home__landing__card--create"
            pack=""
            color="white"
          >
            Create a room.
          </PlayingCard>
        </RouterLink>
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
    <div class="home__variety">
      <div class="home__variety__text-wrapper">
        <h2>As many cards<br />as you will ever need</h2>
        <p>
          Cards against morality currently<br />supports
          <span>{{ state.packs.length }} official card sets</span>,<br />and X
          sets created by the community!
        </p>
      </div>
      <div class="home__variety__circle">
        <div
          v-for="pack in circlePacks"
          class="home__variety__circle__el"
          :style="{ '--pack-color': pack.color ?? undefined }"
          :key="pack.id"
          v-html="pack.icon"
        ></div>
      </div>
      <div class="home__variety__under-circle"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math" as math;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.home {
  h1 {
    text-align: center;
    margin: 0;
    margin-top: 8vh;
    font-size: clamp(1.2rem, 10vw, 64px);
    padding: 0 12px;
  }

  &__brief {
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
  }

  @mixin section-border() {
    border-style: solid;
    border-color: colors.$darkgray;
    border-width: 1px 0;
  }

  &__stripe {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    background-color: rgba(colors.$main-bg, 0.9);
    backdrop-filter: blur(4px);
    z-index: 1;

    @include section-border();

    &__btn {
      --color: transparent;
      --h-color: transparent;
      font-size: 1rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__variety {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 70vh;
    overflow: hidden;

    $section-height: 60%;

    &__text-wrapper {
      $bg-fade: 15%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: end;
      height: $section-height;
      width: 60%;
      background: linear-gradient(
        0deg,
        rgba(colors.$main-bg, 0.85) 0%,
        colors.$main-bg $bg-fade,
        colors.$main-bg (100% - $bg-fade),
        rgba(colors.$main-bg, 0.85) 100%
      );
      backdrop-filter: blur(4px);
      text-align: end;

      @include section-border();

      @include mixins.md {
        width: 50%;
      }

      @include mixins.sm {
        align-items: center;
        background: none;
        backdrop-filter: none;
        text-align: center;
        border: none;
        width: 100%;
      }

      h2 {
        margin: 0;
        margin-bottom: 10px;
        font-size: clamp(1.3rem, 4vw, 2rem);
      }

      p {
        margin: 0;
        font-size: clamp(1rem, 2.6vw, 1.3rem);

        span {
          font-weight: bold;
          font-size: 1.1em;
        }
      }
    }

    @keyframes carousel {
      from {
        transform: rotate(0);
      }

      to {
        transform: rotate(360deg);
      }
    }

    &__circle {
      $carousel-duration: 30s;

      z-index: -1;
      position: relative;
      width: 0;
      height: 0;
      animation: carousel $carousel-duration linear infinite;

      @include mixins.sm {
        position: absolute;
        left: 50%;
        top: 50%;
      }

      $radius: clamp(165px, 40vw, 30vh);
      $num-of-els: 16;

      &__el {
        $size: min(7vw, 50px);

        position: absolute;
        width: $size;
        height: $size;

        :deep(svg) {
          height: 100%;
          width: 100%;

          *[fill="black"] {
            fill: var(--pack-color);
          }

          *[fill="white"] {
            fill: colors.$main-bg;
          }
        }

        @mixin pos($deg, $rotation: 0deg) {
          transform: translate(
              calc(-50% + (cos($deg) * $radius)),
              calc(-50% + (sin($deg) * $radius))
            )
            rotate($rotation);
        }

        @for $i from 1 through $num-of-els {
          $deg: ($i - 1) * math.div(360deg, $num-of-els);

          @keyframes carousel-child-#{$i} {
            from {
              @include pos($deg);
            }

            to {
              @include pos($deg, -360deg);
            }
          }

          &:nth-child(#{$i}) {
            @include pos($deg);
            animation: carousel-child-#{$i} $carousel-duration linear infinite;
          }
        }
      }
    }

    &__under-circle {
      z-index: -2;
      height: $section-height;
      flex-grow: 1;

      @include section-border();

      @include mixins.sm {
        border: none;
      }
    }
  }
}
</style>
