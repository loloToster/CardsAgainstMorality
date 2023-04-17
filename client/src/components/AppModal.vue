<script setup lang="ts">
defineEmits(["close"])
</script>

<template>
  <div @click="$emit('close')" class="modal">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #0e0e0edd;
  z-index: 4;
  overflow: hidden;
}
</style>
