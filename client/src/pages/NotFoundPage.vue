<script setup lang="ts">
import { TITLE } from "@/consts"
import PlayingCard from "@/components/PlayingCard.vue"
</script>

<template>
  <div class="not-found">
    <div class="not-found__main">
      <div class="not-found__cards">
        <PlayingCard class="not-found__card" :pack="TITLE">
          <div class="not-found__num">4</div>
        </PlayingCard>
        <PlayingCard class="not-found__card" color="black" :pack="TITLE">
          <div class="not-found__num">0</div>
        </PlayingCard>
        <PlayingCard class="not-found__card" :pack="TITLE">
          <div class="not-found__num">4</div>
        </PlayingCard>
      </div>
      <h1>Oops! it looks like this page does not exist.</h1>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__main {
    h1 {
      width: min(400px, 90vw);
      text-align: center;
      margin: auto;
      margin-top: 4vh;
    }
  }

  &__cards {
    display: flex;
    z-index: 2;
    width: fit-content;
    gap: 1vw;
  }

  &__card {
    --w: min(200px, 27vw);

    scale: 4;
    animation: fall 300ms ease-out forwards;

    $rotations-start: 25deg, -20deg, -30deg;
    $rotations: -8deg, 5deg, 2deg;

    @for $i from 1 through length($rotations) {
      $rotation-start: nth($rotations-start, $i);
      $rotation: nth($rotations, $i);

      @keyframes fall-#{$i} {
        from {
          rotate: $rotation-start;
          scale: 4;
        }

        60% {
          scale: 0.9;
        }

        80% {
          scale: 1.1;
        }

        to {
          rotate: $rotation;
          scale: 1;
        }
      }

      &:nth-child(#{$i}) {
        rotate: $rotation-start;
        animation: fall-#{$i} 200ms ease-out forwards;
        animation-delay: ($i - 1) * 30ms;
      }
    }
  }

  &__num {
    font-size: var(--w);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>
