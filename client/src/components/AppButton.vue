<script setup lang="ts">
import { computed } from "vue"
import Color from "color"

const props = withDefaults(
  defineProps<{ color?: string; hColor?: string; disabled?: boolean }>(),
  {
    color: "#6b6b6b",
    disabled: false
  }
)

defineEmits<{
  (ev: "click", e: MouseEvent): void
}>()

const hoverColor = computed(() => {
  if (props.color === "transparent") return undefined
  return props.hColor || Color(props.color).darken(0.2).hex()
})
</script>

<template>
  <button
    @click="e => !disabled && $emit('click', e)"
    :style="{
      '--color': color,
      '--h-color': hoverColor
    }"
    :disabled="disabled"
    v-wave="!disabled"
  >
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: var(--color);
  transition: all 50ms;

  &:hover {
    background-color: var(--h-color);
  }

  &:disabled {
    background-color: var(--color);
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
