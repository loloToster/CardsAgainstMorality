<script setup lang="ts">
import { computed } from "vue"
import Color from "color"

const props = defineProps<{ color?: string }>()

defineEmits(["click"])

const light = computed(() => {
  return Color(props.color).isLight()
})
</script>

<template>
  <div
    @click="$emit('click')"
    :style="{ '--chip-bg': color }"
    :class="{ 'chip--light': light }"
    class="chip"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.chip {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 100vh;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--chip-bg, gray);
  cursor: pointer;

  &--light {
    color: black;
  }
}
</style>
