<script setup lang="ts">
import { computed, reactive } from "vue"
import Color from "color"

import { ApiCardPack } from "@backend/types"

import AppChip from "@/components/AppChip.vue"
import PlayingCard from "@/components/PlayingCard.vue"
import defaultPackIcon from "@/assets/black-card-icon.svg?raw"

const pack = reactive<ApiCardPack>({
  id: 0,
  name: "Some Card Pack",
  numOfBlacks: 30,
  numOfWhites: 30
})

const BG_ICONS = [
  {
    top: 17,
    left: 57,
    rotate: -8
  },
  {
    top: 72,
    left: 5,
    rotate: -4
  },
  {
    top: 26,
    left: 75,
    rotate: 5
  },
  {
    top: 79,
    left: 83,
    rotate: 8
  },
  {
    top: 15,
    left: 94,
    rotate: -12
  },
  {
    top: 10,
    left: 10,
    rotate: 10
  }
]

const light = computed(() => {
  return pack.color ? Color(pack.color).isLight() : true
})

const longName = computed(() => {
  return pack.name.length > 12
})

const packIcon = computed(() => {
  return pack.icon || defaultPackIcon
})
</script>

<template>
  <div
    class="pack"
    :style="{
      '--theme-color': pack.color ?? undefined
    }"
  >
    <div class="pack__top">
      <div class="pack__top__icons">
        <div
          v-for="icon in BG_ICONS"
          v-html="packIcon"
          class="pack__top__icon"
          :class="{ 'pack__top__icon--light': !light }"
          :style="{
            '--top': icon.top,
            '--left': icon.left,
            '--rotate': icon.rotate
          }"
          :key="icon.left"
        ></div>
      </div>
      <div class="pack__top__content">
        <div class="pack__image">
          <div class="pack__image__name">{{ pack.name }}</div>
          <div v-html="packIcon" class="pack__image__icon"></div>
        </div>
        <div class="pack__meta" :class="{ 'pack__meta--light': !light }">
          <div class="pack__meta__type">Card Pack</div>
          <h1
            class="pack__meta__name"
            :class="{ 'pack__meta__name--small': longName }"
          >
            {{ pack.name }}
          </h1>
          <div class="pack__meta__tags">
            <AppChip class="pack__meta__tag pack__meta__tag--bundle">
              Some Bundle
            </AppChip>
            <AppChip class="pack__meta__tag" outlined> Tag 2 </AppChip>
            <AppChip class="pack__meta__tag" outlined> Tag 3 </AppChip>
          </div>
          <div class="pack__meta__row">
            <div class="pack__meta__author">Cards Against Humanity</div>
            <div class="pack__meta__likes">100 likes</div>
            <div v-if="pack.numOfBlacks" class="pack__meta__black">
              {{ pack.numOfBlacks }} black cards
            </div>
            <div v-if="pack.numOfWhites" class="pack__meta__white">
              {{ pack.numOfWhites }} white cards
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pack__cards">
      <PlayingCard
        v-for="i in 60"
        class="pack__cards__card"
        :pack="pack.name"
        :key="i"
      >
        {{ i }}
      </PlayingCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.pack {
  --theme-color: white;
  --r: 255;
  --g: 255;
  --b: 255;

  &__top {
    position: relative;
    width: 100%;
    background-color: var(--theme-color);
    height: 35vh;

    &__icon {
      position: absolute;
      top: calc(var(--top) * 1%);
      left: calc(var(--left) * 1%);
      width: 20px;
      height: 20px;
      transform: rotate(calc(var(--rotate) * 1deg));

      --color: black;

      &--light {
        --color: white;
      }

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--theme-color);
        }

        *[fill="black"] {
          fill: var(--color);
        }
      }
    }

    &__content {
      display: flex;
      gap: 65px;
      width: 90%;
      max-width: 1100px;
      height: 100%;
      margin: auto;
    }
  }

  &__image {
    position: relative;
    aspect-ratio: 12 / 17;
    height: 100%;
    background-color: black;
    translate: 0 20%;
    rotate: -3deg;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    @keyframes wiggle {
      0%,
      100% {
        rotate: -3deg;
      }

      30% {
        rotate: -6deg;
      }

      70% {
        rotate: 0deg;
      }
    }

    &:hover {
      animation: wiggle 400ms linear;
    }

    &__name {
      font-size: 2rem;
      font-weight: bold;
    }

    &__icon {
      position: absolute;
      left: 16px;
      bottom: 16px;
      width: 30%;
      aspect-ratio: 1;

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: black;
        }

        *[fill="black"] {
          fill: var(--theme-color);
        }
      }
    }
  }

  &__meta {
    --color: #202020;

    &--light {
      --color: white;
    }

    color: var(--color);
    align-self: flex-end;
    flex-grow: 1;
    margin-bottom: 24px;

    &__type {
      font-size: 0.875rem;
      font-weight: 700;
    }

    &__name {
      margin: 0.08em 0 0.12em;
      font-size: 6rem;

      &--small {
        font-size: 4.2rem;
      }
    }

    &__tags {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    &__tag {
      --chip-bg: var(--color);
      padding: 0 8px;
      height: 26px;

      &--bundle {
        color: var(--theme-color);
      }
    }

    &__author {
      font-weight: 700;
    }

    &__row {
      display: flex;
      font-size: 0.875rem;

      & > * {
        &::before {
          content: "•";
          margin: 0 4px;
        }

        &:first-child::before {
          content: "";
          margin: 0;
        }
      }
    }
  }

  &__cards {
    $gap: 12px;

    --width: 65vw;
    --items-in-row: 5;

    @include mixins.lg {
      --items-in-row: 4;
    }

    @include mixins.md {
      --items-in-row: 3;
    }

    @include mixins.xs {
      --width: 90vw;
      --items-in-row: 2;
    }

    @include mixins.xxs {
      --items-in-row: 1;
    }

    display: flex;
    flex-wrap: wrap;
    gap: $gap;
    width: var(--width);
    margin: auto;
    padding: 15vh 0;

    --size-of-item: calc(
      (var(--width) / var(--items-in-row)) -
        (#{$gap} * (var(--items-in-row) - 1) / var(--items-in-row))
    );

    &__card {
      --w: var(--size-of-item);
    }
  }
}
</style>
