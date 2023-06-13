<script setup lang="ts">
import PackIcon from "@/components/PackIcon.vue"
import PackBaseImg from "@/assets/pack-base.png"

defineProps<{ icon?: string }>()
</script>
<template>
  <div class="card-pack">
    <div class="card-pack__padding">
      <img :src="PackBaseImg" />
      <div class="card-pack__name">
        <slot></slot>
      </div>
      <PackIcon :icon="icon" class="card-pack__icon" />
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.card-pack {
  $horizonal-padding: 10%;
  $vertical-padding: 18%;

  position: relative;
  aspect-ratio: vars.$card-aspect-ratio;

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
