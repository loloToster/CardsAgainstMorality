<script setup lang="ts">
import { reactive, computed, ref, watch } from "vue"
import { onClickOutside } from "@vueuse/core"

import { VotingMeta } from "@backend/types"

import { audioState, toggleAudio } from "@/contexts/audio"
import { gameState } from "../contexts/gamestate"
import { takePicture } from "../contexts/screenshot"

import AppButton from "@/components/AppButton.vue"
import AppTooltip from "@/components/AppTooltip.vue"
import UserAvatar from "@/components/UserAvatar.vue"

const emit = defineEmits<{
  (e: "new-voting", data: VotingMeta): void
}>()

const state = reactive({ gameMenuActive: false, votingMenuActive: false })

const audioTooltip = computed(() => {
  return audioState.on ? "Turn off sound" : "Turn on sound"
})

const votingTooltip = computed(() => {
  return gameState.voting ? "Cannot start a new voting" : "Start a new voting"
})

const gameMenu = ref(null)
onClickOutside(gameMenu, () => (state.gameMenuActive = false))

const votingMenu = ref(null)
onClickOutside(votingMenu, () => (state.votingMenuActive = false))

function toggleVotingMenu() {
  if (gameState.voting) return
  state.votingMenuActive = !state.votingMenuActive
}

watch(
  () => gameState.voting,
  newVal => {
    if (newVal) state.votingMenuActive = false
  }
)

function onVoteToEnd(e: MouseEvent) {
  e.stopPropagation()
  emit("new-voting", { type: "end" })
}
</script>
<template>
  <div class="game-meta">
    <div class="game-menu-wrapper">
      <div
        class="game-menu"
        :class="{ active: state.gameMenuActive }"
        ref="gameMenu"
      >
        <button
          @click="toggleAudio()"
          class="game-menu__btn game-menu__item"
          v-wave
        >
          <AppTooltip
            position="left"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--desktop"
          >
            {{ audioTooltip }}
          </AppTooltip>
          <AppTooltip
            position="right"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--mobile"
          >
            {{ audioTooltip }}
          </AppTooltip>
          <svg
            v-if="audioState.on"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 96 960 960"
          >
            <path
              d="M561.539 900.383v-61.999q86.538-27.538 139.422-100Q753.846 665.923 753.846 575q0-90.923-52.885-163.384-52.884-72.462-139.422-100v-61.999Q673.23 279.54 743.537 369.54q70.307 89.999 70.307 205.46 0 115.461-70.307 205.46-70.307 90-181.998 119.923ZM146.156 675.999V476.001h148.46l171.537-171.536v543.07L294.616 675.999h-148.46Zm415.383 46.154V427.847q40.461 22 62.537 61.961Q646.153 529.77 646.153 576q0 45.615-22.269 84.884t-62.345 61.269Z"
            />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M778.922 981.537 658.307 860.922q-20.769 13.307-43.769 23.076-22.999 9.769-47.614 16.385v-61.999q12.846-4.615 24.999-9.423 12.154-4.807 23-11.423L471.538 674.153v173.382L300.001 675.999h-148.46V476.001h121.845L79.848 282.463 122 240.31l699.074 699.074-42.153 42.153Zm-19.539-216.23-42.999-42.998q20.846-32.539 31.847-69.808 11-37.27 11-77.501 0-90.923-52.885-163.384-52.884-72.462-139.422-100v-61.999Q679 279.54 749.114 369.54q70.115 89.999 70.115 205.46 0 52.615-15.654 101.038-15.654 48.423-44.192 89.269Zm-122.461-122.46-69.998-69.999V427.847q40.461 22 62.537 61.961Q651.538 529.77 651.538 576q0 17.693-3.654 34.5-3.654 16.808-10.962 32.347ZM471.538 477.463l-86.307-86.692 86.307-86.306v172.998Z"
            />
          </svg>
        </button>
        <button
          @click="toggleVotingMenu"
          :disabled="Boolean(gameState.voting)"
          class="game-menu__btn game-menu__item"
          ref="votingMenu"
          v-wave
        >
          <div v-if="state.votingMenuActive" class="game-menu__voting">
            <AppButton @click="onVoteToEnd" class="game-menu__voting__btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                <path
                  d="M320 736h320V416H320v320Zm160 240q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                />
              </svg>
              <span>End the game</span>
            </AppButton>
            <div class="game-menu__voting__sep"></div>
            <AppButton
              @click="e => e.stopPropagation()"
              class="game-menu__voting__btn"
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15,14C17.67,14 23,15.33 23,18V20H7V18C7,15.33 12.33,14 15,14M15,12A4,4 0 0,1 11,8A4,4 0 0,1 15,4A4,4 0 0,1 19,8A4,4 0 0,1 15,12M5,9.59L7.12,7.46L8.54,8.88L6.41,11L8.54,13.12L7.12,14.54L5,12.41L2.88,14.54L1.46,13.12L3.59,11L1.46,8.88L2.88,7.46L5,9.59Z"
                ></path>
              </svg>
              <span>Kick a player</span>
            </AppButton>
          </div>
          <AppTooltip
            v-if="!state.votingMenuActive"
            position="left"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--desktop"
          >
            {{ votingTooltip }}
          </AppTooltip>
          <AppTooltip
            v-if="!state.votingMenuActive"
            position="right"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--mobile"
          >
            {{ votingTooltip }}
          </AppTooltip>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M180 976q-24 0-42-18t-18-42V718l135-149 43 43-118 129h600L669 615l43-43 128 146v198q0 24-18 42t-42 18H180Zm262-305L283 512q-19-19-17-42.5t20-41.5l212-212q17-17 42-17.5t43 17.5l159 159q17 17 17.5 40.5T740 459L528 671q-17 17-42 18t-44-18Zm249-257L541 264 333 472l150 150 208-208Z"
            />
          </svg>
        </button>
        <button
          @click="takePicture"
          class="game-menu__btn game-menu__item"
          v-wave
        >
          <AppTooltip
            position="left"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--desktop"
          >
            Picture of the table
          </AppTooltip>
          <AppTooltip
            position="right"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--mobile"
          >
            Picture of the table
          </AppTooltip>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M479.667 792q73.333 0 123.5-50.167 50.166-50.166 50.166-123.5 0-73.333-50.166-123.166-50.167-49.833-123.5-49.833-73.334 0-123.167 49.833t-49.833 123.166q0 73.334 49.833 123.5Q406.333 792 479.667 792Zm0-66.666q-45.667 0-76-30.667-30.334-30.667-30.334-76.334 0-45.666 30.334-76Q434 512 479.667 512q45.666 0 76.333 30.333 30.667 30.334 30.667 76 0 45.667-30.667 76.334t-76.333 30.667ZM146.666 936q-27 0-46.833-19.833T80 869.334V367.333q0-26.333 19.833-46.5 19.833-20.166 46.833-20.166h140.001L360 216h240l73.333 84.667h140.001q26.333 0 46.499 20.166Q880 341 880 367.333v502.001q0 27-20.167 46.833Q839.667 936 813.334 936H146.666Zm666.668-66.666V367.333H642.667l-73-84.667H390.333l-73 84.667H146.666v502.001h666.668ZM480 618.667Z"
            />
          </svg>
        </button>
        <div
          class="game-meta__sep game-meta__sep--horizontal game-menu__item"
        ></div>
        <button
          @click="state.gameMenuActive = !state.gameMenuActive"
          class="game-menu__btn game-menu__open"
          v-wave
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="m388 976-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185 576q0-9 .5-20.5T188 535L80 456l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669 346l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592 850l-20 126H388Zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="game-meta__sep"></div>
    <div class="players">
      <div
        v-for="player in gameState.players"
        class="players__player"
        :key="player.userId"
      >
        <div class="players__player__avatar">
          <svg
            v-if="player.tsar"
            class="players__player__crown"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 256 256"
            xml:space="preserve"
          >
            <g
              style="
                stroke: none;
                stroke-width: 0;
                stroke-dasharray: none;
                stroke-linecap: butt;
                stroke-linejoin: miter;
                stroke-miterlimit: 10;
                fill: none;
                fill-rule: nonzero;
                opacity: 1;
              "
              transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
            >
              <path
                d="M 78.517 77.617 H 11.483 c -0.951 0 -1.77 -0.669 -1.959 -1.601 L 0.041 29.542 c -0.159 -0.778 0.157 -1.576 0.806 -2.034 c 0.648 -0.459 1.506 -0.489 2.186 -0.079 l 25.585 15.421 l 14.591 -29.358 c 0.335 -0.674 1.021 -1.104 1.774 -1.11 c 0.709 -0.003 1.445 0.411 1.792 1.08 l 15.075 29.1 L 86.968 27.43 c 0.681 -0.41 1.537 -0.379 2.186 0.079 s 0.965 1.256 0.807 2.034 l -9.483 46.474 C 80.286 76.948 79.467 77.617 78.517 77.617 z"
                style="
                  stroke: none;
                  stroke-width: 1;
                  stroke-dasharray: none;
                  stroke-linecap: butt;
                  stroke-linejoin: miter;
                  stroke-miterlimit: 10;
                  fill: goldenrod;
                  fill-rule: nonzero;
                  opacity: 1;
                "
                transform=" matrix(1 0 0 1 0 0) "
                stroke-linecap="round"
              />
            </g>
          </svg>
          <UserAvatar :user="player" class="header__avatar" />
          <div class="players__player__points">{{ player.points }}</div>
        </div>
        <div class="players__player__name-wrapper">
          <div class="players__player__name">{{ player.name }}</div>
          <div v-if="player.leader" class="players__player__leader">
            Room Leader
          </div>
        </div>
        <svg
          v-if="!player.connected"
          class="players__player__disconnected"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 96 960 960"
        >
          <path
            d="M881 546q-88-81-186-129t-215-48q-27 0-52 4t-40 9l-96-96q44-16 89-23t99-7q140 0 262.5 58T960 468l-79 78ZM736 691q-32-31-58.5-50.5T610 604L506 500q91 5 158 41t127 95l-55 55Zm62 304L417 615q-54 14-94.5 41T249 715l-80-79q35-35 71-62t89-49l-94-93q-46 24-84 52.5T79 546L0 467q33-34 73-65.5t78-52.5l-90-90 51-51 736 736-50 51Zm-318-48L332 798q29-29 66.5-45.5T480 736q44 0 81.5 16.5T628 798L480 947Z"
          />
        </svg>
        <svg
          v-else-if="player.ready"
          class="players__player__ready"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 96 960 960"
        >
          <path d="M382 848 122 588l90-90 170 170 366-366 90 90-456 456Z" />
        </svg>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.game-meta {
  flex-shrink: 0;

  &__sep {
    display: none;
    height: 25px;
    width: 2px;
    margin: 0 6px;
    background-color: colors.$lightgray;

    &--horizontal {
      height: 2px;
      width: 25px;
      margin: 6px 0;
    }
  }

  @include mixins.sm() {
    position: fixed;
    display: flex;
    align-items: center;
    bottom: 0;
    left: 0;
    z-index: 3;
    width: 100%;
    padding-top: 4px;
    background-color: rgba(colors.$darkgray, 85%);
    backdrop-filter: blur(8px);
    border-top: solid 1px colors.$lightgray;

    &__sep {
      display: block;
    }
  }
}

.players {
  display: flex;
  gap: 8px;
  flex-direction: column;
  width: 220px;
  max-height: 320px;
  flex-shrink: 0;
  overflow-y: auto;

  &__player {
    display: flex;
    align-items: center;
    padding: 8px;
    background-color: colors.$darkgray;
    border-radius: 8px;

    &__crown {
      position: absolute;
      width: 16px;
      height: 16px;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
    }

    &__avatar {
      position: relative;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      margin-right: 8px;

      img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
      }
    }

    &__points {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      right: -0.3rem;
      bottom: -0.1rem;
      background-color: colors.$primary;
      border-radius: 100vh;
      font-size: 0.75rem;
      font-weight: bold;
      height: 0.9rem;
      min-width: 0.9rem;
      padding: 0 0.55ch;
      padding-top: 0.125rem;
    }

    &__name-wrapper {
      overflow: hidden;
    }

    &__name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__leader {
      font-size: 0.7rem;
    }

    @keyframes fade {
      from {
        opacity: 1;
      }

      to {
        opacity: 0.3;
      }
    }

    &__disconnected {
      fill: colors.$danger;
      animation: fade infinite alternate 1.5s ease-in;
      height: 16px;
      width: 16px;
      margin-left: 4px;
    }

    &__ready {
      flex-shrink: 0;
      height: 16px;
      width: 16px;
      margin-left: 4px;
      fill: colors.$lime;
    }
  }

  @include mixins.sm() {
    flex-grow: 1;
    flex-direction: row;

    &__player {
      background-color: transparent;

      &__avatar {
        margin-right: 0;
      }

      &__name-wrapper {
        display: none;
      }

      &:last-child {
        padding-right: 12px;
      }
    }
  }
}

.game-menu-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(calc(100% + 10px));

  @include mixins.sm() {
    height: 48px;
    width: 48px;
    transform: unset;
    position: relative;
    margin-left: 6px;
  }
}

.game-menu {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__open {
    display: none;
  }

  &__btn {
    position: relative;
    width: 36px;
    height: 36px;
    appearance: none;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
    border-radius: 50%;

    svg {
      width: 32px;
      height: 32px;
      fill: colors.$inp;
    }

    &:disabled svg {
      fill: darken(colors.$inp, 20%);
    }

    &__tooltip {
      display: none;

      &--mobile {
        --gap: 10px;
      }
    }

    &:hover &__tooltip--desktop {
      display: block;
    }
  }

  &__voting {
    position: absolute;
    top: 0;
    right: 100%;
    background-color: colors.$dark-surface;
    padding: 8px;
    border-radius: 4px;

    &__btn {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 1.1rem;
      white-space: nowrap;
      padding: 4px;
      width: 100%;
      color: colors.$subtext;

      --color: transparent;

      svg {
        fill: currentColor;
        width: 1.1em;
        height: 1.1em;
      }

      span {
        flex-grow: 1;
        text-align: right;
      }
    }

    &__sep {
      width: 100%;
      height: 1px;
      margin: 4px 0;
      background-color: colors.$lightgray;
    }
  }

  @include mixins.sm() {
    position: absolute;
    gap: 8px;
    bottom: 2px;
    left: 2px;
    border-radius: 100vw;
    padding: 6px;

    &__item {
      display: none;
    }

    &__btn {
      width: 32px;
      height: 32px;

      svg {
        fill: colors.$lightgray;
      }

      &__tooltip--mobile {
        display: block;
      }

      &:hover &__tooltip--desktop {
        display: none;
      }
    }

    &__open {
      display: block;
      transition: transform 300ms, scale 100ms;

      &:active {
        scale: 0.8;
      }
    }

    &.active &__open {
      transform: rotate(180deg);
    }

    &.active {
      background-color: colors.$dark-surface;
    }

    &.active &__item {
      display: block;
    }

    &__voting {
      top: unset;
      right: unset;
      bottom: 0;
      left: 100%;
      transform: translateX(10px);
    }
  }
}
</style>
