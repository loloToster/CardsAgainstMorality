<script setup lang="ts">
import { computed, reactive } from "vue"

import { TITLE } from "@/consts"
import api from "@/utils/api"
import type { ApiCardPack } from "@backend/types"

const state = reactive<{
  packs: ApiCardPack[]
  numOfOfficialPacks: number | null
  numOfCommunityPacks: number | null
}>({
  packs: [],
  numOfOfficialPacks: null,
  numOfCommunityPacks: null
})

api.get("/api/packs").then(res => {
  state.packs = res.data.packs
  state.numOfOfficialPacks = res.data.allOfficial
  state.numOfCommunityPacks = res.data.allCommunity
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
  <div class="variety">
    <div class="variety__text-wrapper">
      <h2>As many cards<br />as you will ever need</h2>
      <p>
        {{ TITLE }} currently<br />supports
        <span>{{ state.numOfOfficialPacks ?? "..." }} official card sets</span
        >,<br />and {{ state.numOfCommunityPacks ?? "..." }} sets created by the
        community!
      </p>
    </div>
    <div class="variety__circle" :class="{ active: state.packs.length }">
      <div
        v-for="pack in circlePacks"
        class="variety__circle__el"
        :style="{ '--pack-color': pack.color ?? undefined }"
        :key="pack.id"
        v-html="pack.icon"
      ></div>
    </div>
    <div class="variety__under-circle"></div>
  </div>
</template>
<style scoped lang="scss">
@use "sass:math" as math;

@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.variety {
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

    @include mixins.section-border();

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
      margin-bottom: 10px;
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

    @include mixins.sm {
      position: absolute;
      left: 50%;
      top: 50%;
    }

    &.active {
      animation: carousel $carousel-duration linear infinite;
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

    @include mixins.section-border();

    @include mixins.sm {
      border: none;
    }
  }
}
</style>
