<script setup lang="ts">
type Position = "bottom" | "top" | "left" | "right"

withDefaults(defineProps<{ position?: Position }>(), { position: "top" })
</script>

<template>
  <div class="tooltip" :class="`tooltip--${position}`">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.tooltip {
  --gap: 3px;

  position: absolute;
  font-size: 0.875rem;
  white-space: nowrap;
  background-color: #505050;
  padding: 3px 6px;
  border-radius: 3px;
  box-shadow: 0px 0px 2px 0px #0e0e0e;

  &--bottom {
    top: calc(100% + var(--gap));
    left: 50%;
    transform: translateX(-50%);
  }

  &--top {
    top: -var(--gap);
    left: 50%;
    transform: translate(-50%, -100%);
  }

  &--left {
    left: -var(--gap);
    top: 50%;
    transform: translate(-100%, -50%);
  }

  &--right {
    left: calc(100% + var(--gap));
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
