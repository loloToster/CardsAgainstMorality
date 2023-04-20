<script setup lang="ts">
defineProps<{ disabled?: boolean }>()

defineEmits<{
  (ev: "click", e: MouseEvent): void
}>()
</script>

<template>
  <button
    @click="e => !disabled && $emit('click', e)"
    :disabled="disabled"
    v-wave="!disabled"
  >
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: var(--color, colors.$inp);
  transition: all 50ms;
  color: colors.$text;

  &:hover {
    background-color: var(--h-color, darken(colors.$inp, 6%));
  }

  &:disabled {
    background-color: var(--color, colors.$inp);
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
