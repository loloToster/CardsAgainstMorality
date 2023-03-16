<script setup lang="ts">
interface PlayingCardProps {
  pack: string
  color: "white" | "black"
}

withDefaults(defineProps<PlayingCardProps>(), { color: "white" })
</script>

<template>
  <div
    id="black-card"
    class="card"
    :class="color === 'white' ? 'card--white' : 'card--black'"
  >
    <span class="card__text">
      <slot></slot>
    </span>
    <div class="card__pack">
      <img v-if="color === 'white'" src="src/assets/black-card-icon.svg" />
      <img v-else src="src/assets/white-card-icon.svg" />
      <span>{{ pack }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math" as math;

$card-height: 320px;
$card-width: 226px;

$card-padding: $card-width * 0.081;

$card-border-radius: $card-width * 0.049;
$card-main-font-size: $card-width * 0.07;
$card-icon-size: $card-width * 0.098;

.card {
  box-sizing: border-box;
  position: relative;

  width: $card-width;
  aspect-ratio: 12 / 17;
  padding: $card-padding;

  border-radius: $card-border-radius;
  font-size: $card-main-font-size;
  line-height: 140%;
  font-weight: bold;
  box-shadow: -3px 3px 10px -2px #242424;

  img {
    display: inline-block;
    width: $card-icon-size;
    height: $card-icon-size;
  }

  &--white {
    color: black;
    background-color: white;
  }

  &--black {
    color: white;
    background-color: black;
  }

  &__pack {
    position: absolute;
    display: flex;
    align-items: center;

    gap: $card-height * 0.01;
    left: $card-padding;
    bottom: $card-padding;

    font-size: $card-height * 0.03;
  }
}
</style>
