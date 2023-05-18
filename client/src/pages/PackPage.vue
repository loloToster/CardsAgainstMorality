<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { useScroll } from "@vueuse/core"
import Color from "color"

import type { ApiCardPack, ApiBlackCard, ApiWhiteCard } from "@backend/types"

import { notify } from "@/contexts/notifications"

import AppLoading from "@/components/AppLoading.vue"
import AppChip from "@/components/AppChip.vue"
import PlayingCard from "@/components/PlayingCard.vue"
import CardPack from "@/components/CardPack.vue"
import LikeButton from "@/components/LikeButton.vue"

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

interface BgIconPos {
  top: number
  left: number
  rotate: number
  mobile?: Omit<BgIconPos, "mobile" | "rotate">
}

const BG_ICONS: BgIconPos[] = [
  {
    top: 17,
    left: 57,
    rotate: -8,
    mobile: {
      top: 14,
      left: 8
    }
  },
  {
    top: 72,
    left: 5,
    rotate: -4,
    mobile: {
      top: 13,
      left: 90
    }
  },
  {
    top: 26,
    left: 75,
    rotate: 5,
    mobile: {
      top: 44,
      left: 16
    }
  },
  {
    top: 79,
    left: 83,
    rotate: 8
  },
  {
    top: 15,
    left: 94,
    rotate: -12,
    mobile: {
      top: 49,
      left: 82
    }
  },
  {
    top: 10,
    left: 10,
    rotate: 10,
    mobile: {
      top: 26,
      left: 73
    }
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

async function handleLike(liked: boolean) {
  if (!state.pack) return

  const res = await fetch(`/api/pack/${state.pack.id}/like`, {
    method: liked ? "PUT" : "DELETE"
  })

  if (!res.ok)
    notify({ type: "error", text: `Failed to ${liked ? "like" : "dislike"}` })
}
</script>

<template>
  <AppLoading v-if="state.loading">Loading the Pack</AppLoading>
  <div
    v-else-if="state.pack"
    class="pack"
    :class="{ 'pack--light': light }"
    :style="{
      '--pack-color': state.pack.color ?? undefined
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
          :class="{ 'pack__top__icon--mobile': icon.mobile }"
          :style="{
            '--top': icon.top,
            '--left': icon.left,
            '--rotate': icon.rotate,
            '--mobile-top': icon.mobile?.top,
            '--mobile-left': icon.mobile?.left
          }"
          :key="icon.left"
        ></div>
      </div>
      <div class="pack__top__content">
        <CardPack class="pack__image" :icon="state.pack.icon ?? undefined">
          {{ state.pack.name }}
        </CardPack>
        <div class="pack__meta">
          <RouterLink
            :to="`/packs?types=${state.pack.type.id}`"
            class="pack__meta__type"
          >
            {{ state.pack.type.name }}
          </RouterLink>
          <h1
            class="pack__meta__name"
            :style="{ '--length': state.pack.name.length }"
          >
            {{ state.pack.name }}
          </h1>
          <div class="pack__meta__tags">
            <RouterLink
              v-if="state.pack.bundle"
              :to="`/packs?bundles=${state.pack.bundle.id}`"
            >
              <AppChip class="pack__meta__tag pack__meta__tag--bundle">
                {{ state.pack.bundle.name }}
              </AppChip>
            </RouterLink>
            <RouterLink
              v-for="tag in state.pack.tags"
              :to="`/packs?tags=${tag.id}`"
              :key="tag.id"
            >
              <AppChip class="pack__meta__tag" outlined>
                {{ tag.name }}
              </AppChip>
            </RouterLink>
          </div>
          <div class="pack__meta__row">
            <div class="pack__meta__author">Cards Against Humanity</div>
            <div v-if="state.pack.likedBy" class="pack__meta__likes">
              {{ state.pack.likedBy }} likes
            </div>
            <div v-if="state.pack.numOfBlacks" class="pack__meta__black">
              {{ state.pack.numOfBlacks }} black cards
            </div>
            <div v-if="state.pack.numOfWhites" class="pack__meta__white">
              {{ state.pack.numOfWhites }} white cards
            </div>
          </div>
          <div class="pack__meta__actions">
            <LikeButton
              :liked="state.pack.liked ?? false"
              @change="handleLike"
            />
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
          :pack="state.pack.name"
          :pick="card.pick"
          :draw="card.draw"
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
  --pack-color: white;
  --r: 255;
  --g: 255;
  --b: 255;

  --bg-icon-color: white;
  --meta-content-color: white;

  &--light {
    --bg-icon-color: black;
    --meta-content-color: #{colors.$pack-color};
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
    background-color: var(--pack-color);
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
          fill: var(--pack-color);
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
    background-color: var(--pack-color);

    &__icon {
      position: absolute;
      top: calc(var(--top) * 1%);
      left: calc(var(--left) * 1%);
      width: 20px;
      height: 20px;
      transform: rotate(calc(var(--rotate) * 1deg));

      @include mixins.sm {
        display: none;

        &--mobile {
          display: block;
          top: calc(var(--mobile-top) * 1%);
          left: calc(var(--mobile-left) * 1%);
        }
      }

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--pack-color);
        }

        *[fill="black"] {
          fill: var(--bg-icon-color);
        }
      }
    }

    &__content {
      display: flex;
      align-items: end;
      gap: 65px;
      width: 90%;
      max-width: 1100px;
      height: 100%;
      margin: auto;

      @include mixins.sm {
        align-items: center;
        flex-direction: column;
        gap: 24px;
        padding-top: 24px;
      }
    }
  }

  &__image {
    height: 35vh;
    transform: translate(0, 20%);
    rotate: -3deg;
    font-size: 2rem;

    @include mixins.sm {
      height: 20vh;
      transform: translate(0, 0);
      rotate: -3deg;
      font-size: 1.2rem;
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
  }

  &__meta {
    position: relative;
    color: var(--meta-content-color);
    flex-grow: 1;
    padding-bottom: 24px;

    &__type {
      width: fit-content;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      color: inherit;
      cursor: pointer;

      &:hover {
        text-decoration: underline 2px;
      }
    }

    &__name {
      // on what length the text should shrink
      --text-boundry: 11;
      // text size reference
      --text-base: 6.5vw;

      margin-top: max(0.08em, 6px);
      margin-bottom: max(0.12em, 10px);
      font-size: clamp(
        1.8rem,
        (var(--text-boundry) / var(--length)) * var(--text-base),
        6rem
      );

      @include mixins.sm {
        --text-boundry: 13;
        --text-base: 11vw;
      }
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;

      a {
        text-decoration: none;
      }
    }

    &__tag {
      --chip-bg: var(--meta-content-color);

      padding: 0 8px;
      height: 26px;

      &--bundle {
        color: var(--pack-color);
      }
    }

    &__author {
      font-weight: 700;
    }

    &__row {
      display: flex;
      flex-wrap: wrap;
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

    &__actions {
      position: absolute;
      bottom: 0;
      left: 0;
      transform: translateY(100%);
      width: 100%;
      padding-top: 16px;
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
    $size: clamp(48px, 5vw, 64px);

    display: flex;
    align-items: center;
    justify-content: center;
    width: $size;
    height: $size;
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
