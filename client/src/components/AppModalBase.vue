<script setup lang="ts">
defineEmits(["close"])
</script>

<template>
  <div class="modal-base">
    <div @click="$emit('close')" class="modal-base__closer"></div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.modal-base {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  overflow: hidden;
  background-color: colors.$modal-bg;

  &__closer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
