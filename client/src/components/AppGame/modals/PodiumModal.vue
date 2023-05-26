<script setup lang="ts">
import { computed, onMounted } from "vue"

import type { PodiumEl } from "@backend/types"

import confetti from "@/contexts/confetti"
import { user } from "@/contexts/user"

import AppModal from "@/components/AppModal.vue"
import UserAvatar from "@/components/UserAvatar.vue"

const props = defineProps<{ podium: PodiumEl[] }>()

defineEmits(["close"])

onMounted(() => {
  if (props.podium[0].id === user.value?.id) confetti.addConfetti()
})

const top = computed(() => {
  return [3, 1, 2]
    .map(n => props.podium.find(p => p.place === n))
    .filter(p => p) as PodiumEl[]
})

const bottom = computed(() => {
  return [...props.podium].splice(3)
})
</script>

<template>
  <AppModal @close="$emit('close')" transparent>
    <div class="podium">
      <div class="podium__cols">
        <div
          v-for="player in top"
          class="podium__col"
          :class="`podium__col--${player.place}`"
          :key="player.place"
        >
          <svg
            v-if="player.place === 1"
            class="podium__col__crown"
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
          <UserAvatar :user="player" class="podium__col__img" />
          <div class="podium__col__name-points">
            <span class="podium__col__name">{{ player.name }}</span>
            <span class="podium__col__points">({{ player.points }})</span>
          </div>
          <div class="podium__col__elevation">{{ player.place }}</div>
        </div>
      </div>
      <div class="podium__table">
        <div v-for="row in bottom" class="podium__table__row" :key="row.place">
          <div class="podium__table__name">{{ row.place }}. {{ row.name }}</div>
          <div class="podium__table__splitter"></div>
          <div class="podium__table__points">{{ row.points }}</div>
        </div>
      </div>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.podium {
  &__cols {
    display: flex;
    align-items: end;
  }

  &__col {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 3px;
    width: min(25vw, 180px);

    $col-heights: 140px, 100px, 70px;

    @for $i from 1 through length($col-heights) {
      $h: nth($col-heights, $i);

      &--#{$i} {
        --h: #{$h};
      }
    }

    &__crown {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -70%);
      height: min(7vw, 50px);
      width: min(7vw, 50px);
    }

    &__img {
      width: 50%;
      aspect-ratio: 1;
      border-radius: 50%;
    }

    &__name-points {
      font-size: clamp(0.85rem, 3vw, 1.3rem);
      max-width: 100%;
      text-align: center;

      & > * {
        display: inline-block;
        overflow: hidden;
      }
    }

    &__name {
      margin-right: 0.4ch;
      max-width: 70%;
    }

    &__elevation {
      height: var(--h);
      width: 100%;
      overflow: hidden;
      background-color: colors.$light-surface;
      text-align: center;
      padding-top: 16px;
      font-size: 2.2rem;
      margin-top: 10px;
    }
  }

  &__table {
    width: 100%;
    padding: 10px;
    color: colors.$subtext;
    font-size: 1.2rem;

    &__row {
      display: flex;
      gap: 8px;
      width: 100%;
      margin-bottom: 6px;
    }

    &__splitter {
      position: relative;
      top: -4px;
      flex-grow: 1;
      border-bottom: dotted 2px currentColor;
    }
  }
}
</style>
