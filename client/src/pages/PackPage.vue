<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRoute } from "vue-router"
import { useScroll } from "@vueuse/core"
import Color from "color"

import { ApiCardPack, ApiBlackCard, ApiWhiteCard } from "@backend/types"

import AppLoading from "@/components/AppLoading.vue"
import AppChip from "@/components/AppChip.vue"
import PlayingCard from "@/components/PlayingCard.vue"

import defaultPackIcon from "@/assets/black-card-icon.svg?raw"
import BlackCardIcon from "@/assets/black-card-icon.svg?component"
import WhiteCardIcon from "@/assets/white-card-icon.svg?component"

const route = useRoute()

const state = reactive<{
  pack: ApiCardPack | null
  loading: boolean
  fetchedBlackCards: ApiBlackCard[]
  fetchedWhiteCards: ApiWhiteCard[]
  showMiniTop: boolean
}>({
  pack: null,
  loading: true,
  fetchedBlackCards: [],
  fetchedWhiteCards: [],
  showMiniTop: false
})

// TODO: add pagination
async function fetchCards(id: number) {
  const res = await fetch(`/api/pack/${id}/cards`)
  if (!res.ok) return

  const { cards } = await res.json()
  state.fetchedBlackCards = cards.blackCards
  state.fetchedWhiteCards = cards.whiteCards
}

fetch("/api/pack/" + encodeURIComponent(route.params.id.toString())).then(
  async res => {
    if (res.ok) {
      const { pack } = await res.json()
      state.pack = pack
      state.loading = false
      fetchCards(pack.id)
    }
  }
)

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

const top = ref<HTMLElement>()

useScroll(window, {
  onScroll() {
    if (!top.value) return
    const { y, height } = top.value.getBoundingClientRect()
    state.showMiniTop = y + height < 0
  }
})

const light = computed(() => {
  return state.pack?.color ? Color(state.pack.color).isLight() : true
})

const longName = computed(() => {
  return (state.pack?.name.length || 0) > 12
})

const packIcon = computed(() => {
  return state.pack?.icon || defaultPackIcon
})

const numOfBlackDummies = computed(() => {
  if (!state.pack) return 0
  return state.pack.numOfBlacks - state.fetchedBlackCards.length
})

const numOfWhiteDummies = computed(() => {
  if (!state.pack) return 0
  return state.pack.numOfWhites - state.fetchedWhiteCards.length
})
</script>

<template>
  <AppLoading v-if="state.loading">Loading the Pack</AppLoading>
  <div
    v-else-if="state.pack"
    class="pack"
    :class="{ 'pack--light': light }"
    :style="{
      '--theme-color': state.pack.color ?? undefined
    }"
  >
    <div class="pack__mini-top" :class="{ active: state.showMiniTop }">
      <div class="pack__mini-top__content">
        <div v-html="packIcon" class="pack__mini-top__icon"></div>
        <div class="pack__mini-top__name">{{ state.pack.name }}</div>
      </div>
    </div>
    <div class="pack__top" ref="top">
      <div class="pack__top__icons">
        <div
          v-for="icon in BG_ICONS"
          v-html="packIcon"
          class="pack__top__icon"
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
          <div class="pack__image__name">
            {{ state.pack.name }}
          </div>
          <div v-html="packIcon" class="pack__image__icon"></div>
        </div>
        <div class="pack__meta">
          <div class="pack__meta__type">Card Pack</div>
          <h1
            class="pack__meta__name"
            :class="{ 'pack__meta__name--small': longName }"
          >
            {{ state.pack.name }}
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
            <div v-if="state.pack.numOfBlacks" class="pack__meta__black">
              {{ state.pack.numOfBlacks }} black cards
            </div>
            <div v-if="state.pack.numOfWhites" class="pack__meta__white">
              {{ state.pack.numOfWhites }} white cards
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pack__cards-wrapper">
      <div id="black-cards" class="pack__cards pack__cards--black">
        <div
          class="pack__cards__dummy"
          v-for="i in numOfBlackDummies"
          :key="i"
        ></div>
        <PlayingCard
          v-for="card in state.fetchedBlackCards"
          class="pack__cards__card"
          color="black"
          :text="card.text"
          :pick="card.pick"
          :pack="state.pack.name"
          :key="card.id"
        />
      </div>
      <div id="white-cards" class="pack__cards pack__cards--white">
        <div
          class="pack__cards__dummy"
          v-for="i in numOfWhiteDummies"
          :key="i"
        ></div>
        <PlayingCard
          v-for="card in state.fetchedWhiteCards"
          class="pack__cards__card"
          :text="card.text"
          :pack="state.pack.name"
          :key="card.id"
        />
      </div>
      <div class="pack__goto-wrapper">
        <a
          class="pack__goto pack__goto--black"
          href="#black-cards"
          title="Scroll to Black Cards"
        >
          <WhiteCardIcon />
        </a>
        <a
          class="pack__goto pack__goto--white"
          href="#white-cards"
          title="Scroll to White Cards"
        >
          <BlackCardIcon />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as vars;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.pack {
  --theme-color: white;
  --r: 255;
  --g: 255;
  --b: 255;

  --bg-icon-color: white;
  --meta-content-color: white;

  &--light {
    --bg-icon-color: black;
    --meta-content-color: #202020;
  }

  $mini-top-height: 30px;

  &__mini-top {
    position: fixed;
    top: vars.$header-height;
    left: 0;
    z-index: 1;
    height: 0;
    width: 100%;
    overflow: hidden;
    background-color: var(--theme-color);
    transition: height 50ms ease-out;

    &.active {
      height: $mini-top-height;
      transition: height 200ms ease-out;
    }

    &__content {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 90%;
      max-width: 1100px;
      height: 100%;
      margin: auto;
    }

    &__icon {
      height: 20px;
      width: 20px;

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--theme-color);
        }

        *[fill="black"] {
          fill: var(--meta-content-color);
        }
      }
    }

    &__name {
      color: var(--meta-content-color);
      font-weight: bold;
      font-size: 0.875rem;
    }
  }

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

      @include mixins.sm {
        display: none;
      }

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--theme-color);
        }

        *[fill="black"] {
          fill: var(--bg-icon-color);
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

    @include mixins.sm {
      display: none;
    }

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
    color: var(--meta-content-color);
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
      --chip-bg: var(--meta-content-color);
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

  $cards-gap: 12px;

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

    display: flex;
    flex-wrap: wrap;
    gap: $gap;
    width: var(--width);
    margin: auto;
    scroll-margin-top: calc(
      vars.$header-height + $mini-top-height + $cards-gap
    );

    --size-of-item: calc(
      (var(--width) / var(--items-in-row)) -
        (#{$gap} * (var(--items-in-row) - 1) / var(--items-in-row))
    );

    $big-card-gap: $cards-gap * 4;

    &--black {
      margin-top: 130px;
      margin-bottom: $big-card-gap;

      @include mixins.sm {
        margin-top: $big-card-gap;
      }
    }

    &--white {
      margin-bottom: $big-card-gap;
    }

    &__card {
      --w: var(--size-of-item);
    }

    &__dummy {
      width: var(--size-of-item);
      aspect-ratio: 12/ 17;
      background-color: colors.$light-surface;
      // todo: move dummies to Card Component
      border-radius: calc(var(--size-of-item) * 0.049);
    }
  }

  &__goto-wrapper {
    position: fixed;
    right: 30px;
    bottom: 30px;
    display: flex;
    gap: 8px;
  }

  &__goto {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    transition: scale 100ms;
    outline: solid 2px colors.$main-bg;

    &:hover {
      scale: 1.1;
    }

    &:active {
      scale: 0.95;
    }

    &--black {
      background-color: black;
    }

    &--white {
      background-color: white;
    }

    svg {
      width: 50%;
      height: 50%;
    }
  }
}
</style>
