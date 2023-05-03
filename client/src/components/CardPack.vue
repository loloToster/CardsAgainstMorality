<script setup lang="ts">
import PackBaseImg from "@/assets/pack-base.png"
import defaultPackIcon from "@/assets/black-card-icon.svg?raw"

withDefaults(defineProps<{ icon?: string }>(), {
  icon: defaultPackIcon
})
</script>
<template>
  <div class="card-pack">
    <div class="card-pack__padding">
      <img :src="PackBaseImg" />
      <div class="card-pack__name">
        <slot></slot>
      </div>
      <div v-html="icon" class="card-pack__icon"></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;

.card-pack {
  $horizonal-padding: 10%;
  $vertical-padding: 18%;

  position: relative;
  aspect-ratio: 12 / 17;

  &__padding {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: $vertical-padding $horizonal-padding;
  }

  img {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5));
    pointer-events: none;
  }

  &__name {
    font-weight: bold;
  }

  &__icon {
    margin-top: auto;
    margin-bottom: 2%;
    width: 36%;
    aspect-ratio: 1;

    :deep(svg) {
      width: 100%;
      height: 100%;

      *[fill="white"] {
        fill: colors.$pack-color;
      }

      *[fill="black"] {
        fill: var(--pack-color, white);
      }
    }
  }
}
</style>
