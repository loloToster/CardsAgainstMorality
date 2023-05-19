<script setup lang="ts">
import { ref } from "vue"

withDefaults(
  defineProps<{
    activeIdx: number | null
    numOfChoices: number
    numOfCards?: number
    choosable?: boolean
  }>(),
  {
    numOfCards: 1
  }
)

const emit = defineEmits<{
  (e: "changeIdx", idx: number): void
  (e: "choose", idx: number): void
}>()

const choices = ref<HTMLDivElement>()

function onScroll(e: WheelEvent) {
  e.preventDefault()

  choices.value?.scrollBy({
    left: e.deltaY
  })
}

function onTransEnd(e: TransitionEvent, idx: number) {
  if (e.propertyName !== "width" || !choices.value) return

  const choice = choices.value.querySelectorAll(".choices__choice")[idx]
  const choose = choice.querySelector(".choices__choice__choose")
  const chooseProgress = choose?.querySelector(
    ".choices__choice__choose__progress"
  )

  if (!choose || !chooseProgress) return

  const { width: chooseWidth } = choose.getBoundingClientRect()
  const { width: chooseProgressWidth } = chooseProgress.getBoundingClientRect()

  if (chooseWidth === chooseProgressWidth) emit("choose", idx)
}
</script>

<template>
  <div @wheel="onScroll" class="choices" ref="choices">
    <div
      v-for="choice in numOfChoices"
      @click="$emit('changeIdx', choice - 1)"
      class="choices__choice"
      :class="[
        { active: activeIdx === choice - 1 },
        `choices__choice--${numOfCards}-cards`
      ]"
      :style="{ '--n-of-cards': numOfCards }"
      :key="choice"
    >
      <div
        v-for="i in numOfCards - 1"
        class="choices__choice__card"
        :key="i"
      ></div>
      <div class="choices__choice__card">{{ choice }}</div>
      <div
        v-if="choosable && activeIdx === choice - 1"
        @transitionend="e => onTransEnd(e, choice - 1)"
        class="choices__choice__choose"
        v-tooltip.top="'Hold to choose'"
      >
        <div class="choices__choice__choose__progress"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path d="M382 848 122 588l90-90 170 170 366-366 90 90-456 456Z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.choices {
  $card-w: min(6.6vh, 56px);
  $card-h: min(9.2vh, 80px);
  $card-margin: 6px;

  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  width: fit-content;
  max-width: 100%;
  margin: auto;
  overflow-y: hidden;
  overflow-x: auto;
  padding: 0 12px;

  &::-webkit-scrollbar {
    height: 8px;

    @media (hover: none) {
      height: 0;
    }

    &-track {
      background: #424242;
    }

    &-thumb {
      background: #686868;

      &:hover {
        background: #7b7b7b;
      }
    }
  }

  scrollbar-width: thin;

  @media (hover: none) {
    scrollbar-width: none;
  }

  &__choice {
    --n-of-cards: 1;

    position: relative;
    width: calc($card-w + (($card-margin * (var(--n-of-cards) - 1))));
    height: $card-h;
    flex-shrink: 0;

    font-size: clamp(1.1rem, 4.5vh, 1.8rem);
    transition: font-size 150ms linear;

    &.active {
      font-size: clamp(1.5rem, 6vh, 3.3rem);
      z-index: 1;
    }

    &__card {
      position: absolute;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      width: $card-w;
      height: $card-h;

      color: black;
      background-color: white;
      box-shadow: -2px 1px 7px 0 #262626;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 150ms ease-out;
      transform-origin: bottom;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          left: $card-margin * ($i - 1);
        }
      }
    }

    &--1-cards.active {
      .choices__choice__card {
        transform: translateY(-10%);
      }
    }

    &--2-cards.active {
      .choices__choice__card:nth-child(1) {
        transform: rotate(-5deg);
      }
      .choices__choice__card:nth-child(2) {
        transform: rotate(5deg);
      }
    }

    &--3-cards.active {
      .choices__choice__card:nth-child(1) {
        transform: rotate(-8deg) translateY(-5%);
      }
      .choices__choice__card:nth-child(2) {
        transform: translateY(-5%);
      }
      .choices__choice__card:nth-child(3) {
        transform: rotate(8deg);
      }
    }

    &__choose {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: 0;
      right: 0;
      width: 36px;
      height: 36px;
      background-color: colors.$lime;
      border-radius: 50%;
      cursor: pointer;
      transform: translate(20%, 20%);

      &__progress {
        position: absolute;
        background-color: colors.$green;
        border-radius: 50%;
        opacity: 0.6;
        width: 0;
        height: 0;
        transition: all 1s;
        z-index: -1;
      }

      &:active &__progress {
        width: 100%;
        height: 100%;
      }

      svg {
        width: 24px;
        height: 24px;
        fill: white;
      }
    }
  }
}
</style>
