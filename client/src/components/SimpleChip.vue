<script setup lang="ts">
defineEmits(["click"])
</script>

<template>
  <div @click="$emit('click')" class="chip">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.chip {
  display: inline-block;
  padding: 0.3rem 0.5rem;
  border-radius: 100vh;
  font-size: 0.875rem;
  background-color: var(--chip-bg, gray);
  cursor: pointer;
}
</style>
