<script setup lang="ts">
import { reactive, computed } from "vue"
import { TITLE } from "@/consts"
import { delay, getRandomInt } from "@/utils"
import PlayingCard from "@/components/PlayingCard.vue"

const TEXTS = [
  "Test text Test text Test text Test text.",
  "Some custom card.",
  "Test Test TEST."
]

const state = reactive({
  curText: 0,
  nChars: 0,
  typing: false
})

async function runAnimation() {
  state.typing = true
  state.nChars = 0

  while (state.nChars < TEXTS[state.curText].length) {
    await delay(getRandomInt(90, 120))
    state.nChars++
  }

  await delay(200)
  state.typing = false
  await delay(5000)

  state.typing = true
  while (state.nChars > 0) {
    state.nChars--
    await delay(25)
  }

  state.curText = (state.curText + 1) % TEXTS.length
  runAnimation()
}

runAnimation()

const displayedText = computed(() => {
  return TEXTS[state.curText].slice(0, state.nChars)
})
</script>
<template>
  <div class="custom">
    <div class="custom__cards">
      <div>
        <PlayingCard class="custom__cards__card" :pack="TITLE">
          <span
            class="custom__cards__example-text"
            :class="{ typing: state.typing }"
          >
            {{ displayedText }}
          </span>
        </PlayingCard>
        <PlayingCard class="custom__cards__card" color="black" />
        <PlayingCard class="custom__cards__card" />
      </div>
      <div>
        <div class="custom__cards__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="M195.935-125.652v-68.37h568.13v68.37h-568.13ZM480-271.152q-103.587 0-162.718-59.935-59.13-59.935-59.13-162.804v-345.392h90.652v344.196q0 63 34.598 100.163T480-357.761q62 0 96.598-37.163t34.598-100.163v-344.196h90.891v345.392q0 102.869-59.25 162.804T480-271.152Z"
            />
          </svg>
        </div>
        <div class="custom__cards__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="M238-175v-611h289q75 0 126 48.5T704-622q0 30-17.5 67.5T623-497v8q57 19 78.5 63t21.5 80q0 60-50.5 115.5T533-175H238Zm111-90h163q23 0 58.5-20t35.5-70q0-49-35-69.5T514-445H349v180Zm0-266h156q29 0 57.5-23t28.5-60q0-34-26.5-59T504-698H349v167Z"
            />
          </svg>
        </div>
        <div class="custom__cards__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="M219.456-193.022v-88.369h135.196L491.978-685.37H334.652v-88.13h388.131v88.13H587.826L450.5-281.391h157.326v88.369h-388.37Z"
            />
          </svg>
        </div>
      </div>
    </div>
    <div class="custom__text-wrapper">
      <h2>Unleash your creativity</h2>
      <p>Log in and create you own custom cards!</p>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.custom {
  display: flex;
  align-items: center;
  height: 70vh;
  width: 900px;
  max-width: 90vw;
  margin: auto;
  scroll-margin-top: calc(vars.$header-height + 40px);

  &__cards {
    isolation: isolate;
    position: relative;

    &__card {
      top: 0;
      left: 0;
      position: absolute;

      &:nth-child(1) {
        position: static;
        --w: min(264px, 50vw);
        transform: rotate(-5deg) translate(-10%, 0);
      }

      &:nth-child(2) {
        z-index: -1;
        --w: min(244px, 45vw);
        transform: rotate(10deg) translate(26%, 10%);
      }

      &:nth-child(3) {
        z-index: -2;
        --w: min(224px, 40vw);
        transform: rotate(20deg) translate(65%, 15%);
      }
    }

    @keyframes not-typing {
      0%,
      49% {
        border-right-color: transparent;
      }

      50%,
      100% {
        border-right-color: black;
      }
    }

    &__example-text {
      border-right: solid black 2px;
      padding-right: 1px;
      animation: not-typing 500ms alternate infinite linear;

      &.typing {
        animation: none;
      }
    }

    &__icon {
      position: absolute;
      width: var(--size);
      height: var(--size);

      &:nth-child(1) {
        --size: 60px;
        left: -81%;
        top: 51%;
        transform: rotate(-6deg);
      }

      &:nth-child(2) {
        --size: 80px;
        left: 139%;
        top: -12%;
        transform: rotate(3deg);
      }

      &:nth-child(3) {
        --size: 70px;
        left: 15%;
        top: 107%;
        transform: rotate(5deg);
      }

      svg {
        width: 100%;
        height: 100%;
        fill: colors.$lightgray;
      }
    }
  }

  &__text-wrapper {
    margin-top: 56px;
    margin-left: min(160px, 15vw);

    p {
      font-size: clamp(1rem, 2.6vw, 1.3rem);
    }
  }
}
</style>
