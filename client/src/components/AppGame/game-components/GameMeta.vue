<script setup lang="ts">
import { reactive, computed } from "vue"

import { gameState, toggleAudio } from "../contexts/gamestate"

import AppTooltip from "../../AppTooltip.vue"
import UserAvatar from "../../UserAvatar.vue"

const state = reactive({ gameMenuActive: false })

const audioTooltip = computed(() => {
  return gameState.audio ? "Turn off sound" : "Turn on sound"
})
</script>
<template>
  <div class="game-meta">
    <div class="game-menu-wrapper">
      <div class="game-menu" :class="{ active: state.gameMenuActive }">
        <button
          @click="toggleAudio"
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
            v-if="gameState.audio"
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
        <button class="game-menu__btn game-menu__item" v-wave>
          <AppTooltip
            position="left"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--desktop"
          >
            Start a new voting
          </AppTooltip>
          <AppTooltip
            position="right"
            class="game-menu__btn__tooltip game-menu__btn__tooltip--mobile"
          >
            Start a new voting
          </AppTooltip>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M180 976q-24 0-42-18t-18-42V718l135-149 43 43-118 129h600L669 615l43-43 128 146v198q0 24-18 42t-42 18H180Zm262-305L283 512q-19-19-17-42.5t20-41.5l212-212q17-17 42-17.5t43 17.5l159 159q17 17 17.5 40.5T740 459L528 671q-17 17-42 18t-44-18Zm249-257L541 264 333 472l150 150 208-208Z"
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
@mixin mobile {
  @media (max-width: 900px) {
    @content;
  }
}
.game-meta {
  &__sep {
    display: none;
    height: 25px;
    width: 2px;
    margin: 0 6px;
    background-color: #afafaf;

    &--horizontal {
      height: 2px;
      width: 25px;
      margin: 6px 0;
    }
  }

  @include mobile() {
    position: fixed;
    display: flex;
    align-items: center;
    bottom: 0;
    left: 0;
    z-index: 3;
    width: 100%;
    padding-top: 4px;
    background-color: #4c4c4cdd;
    backdrop-filter: blur(8px);
    border-top: solid 1px gray;

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
    background-color: #4c4c4c;
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
      background-color: darkcyan;
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
      fill: crimson;
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
      fill: limegreen;
    }
  }

  @include mobile() {
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

  @include mobile() {
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
      fill: #585858;
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

  @include mobile() {
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
        fill: #afafaf;
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
      background-color: #161616;
    }

    &.active &__item {
      display: block;
    }
  }
}
</style>
