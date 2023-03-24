<script setup lang="ts">
interface PlayingCardProps {
  text?: string
  pack: string
  color: "white" | "black"
  width?: number
}

withDefaults(defineProps<PlayingCardProps>(), { color: "white" })
defineEmits(["click"])
</script>

<template>
  <div
    @click="$emit('click')"
    class="card"
    :class="color === 'white' ? 'card--white' : 'card--black'"
    :style="width ? { '--w': width + 'px' } : undefined"
  >
    <span class="card__text">
      <span v-if="text" v-html="text"></span>
      <slot v-else></slot>
    </span>
    <div class="card__pack">
      <img v-if="color === 'white'" src="src/assets/black-card-icon.svg" />
      <img v-else src="src/assets/white-card-icon.svg" />
      <span>{{ pack }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$default-card-height: 320px;
$default-card-width: 226px;

.card {
  --w: #{$default-card-width};

  --padding: calc(var(--w) * 0.081);
  --border-radius: calc(var(--w) * 0.049);
  --main-font-size: calc(var(--w) * 0.07);
  --main-icon-size: calc(var(--w) * 0.098);

  box-sizing: border-box;
  position: relative;

  width: var(--w);
  aspect-ratio: 12 / 17;
  padding: var(--padding);

  border-radius: var(--border-radius);
  font-size: var(--main-font-size);
  line-height: 140%;
  font-weight: bold;
  box-shadow: -3px 3px 10px -2px #242424;

  img {
    display: inline-block;
    width: var(--main-icon-size);
    height: var(--main-icon-size);
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

    gap: calc(var(--w) * 0.014);
    left: var(--padding);
    bottom: var(--padding);

    font-size: calc(var(--w) * 0.04);
  }
}
</style>
