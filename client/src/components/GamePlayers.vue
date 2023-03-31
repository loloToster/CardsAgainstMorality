<script setup lang="ts">
import { ApiPlayer } from "@backend/types"
import UserAvatar from "./UserAvatar.vue"

defineProps<{ players: ApiPlayer[] }>()
</script>
<template>
  <div class="players">
    <div v-for="player in players" class="players__player" :key="player.userId">
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
</template>
<style scoped lang="scss">
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

  @media (max-width: 900px) {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    flex-direction: row;
    padding-top: 4px;
    background-color: #4c4c4cdd;
    backdrop-filter: blur(8px);
    border-top: solid 1px gray;

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
</style>
