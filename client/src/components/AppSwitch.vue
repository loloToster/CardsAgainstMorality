<script setup lang="ts">
import { reactive } from "vue"

defineProps<{
  modelValue: boolean
}>()

const state = reactive({
  val: false
})

const emit = defineEmits<{
  (ev: "update:modelValue", newVal: boolean): void
}>()

function onChange() {
  state.val = !state.val
  emit("update:modelValue", state.val)
}
</script>

<template>
  <div
    @click="onChange"
    :class="{ active: state.val }"
    class="switch"
    role="checkbox"
    :aria-checked="state.val"
  >
    <div class="switch__thumb"></div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math" as math;

$h: 24px;
$w: 48px;
$inset: 3px;
$hover-size: 34px;

.switch {
  position: relative;
  height: $h;
  width: $w;
  border-radius: 100vh;
  background-color: #2f2f2f;
  cursor: pointer;
  transition: background-color 100ms;

  &.active {
    background-color: #2eaa55;
  }

  &__thumb {
    $size: $h - (2 * $inset);

    position: absolute;
    top: $inset;
    left: $inset;
    height: $size;
    width: $size;
    background-color: #949494;
    transition: inherit;
    border-radius: 50%;
    transition: left 100ms, outline-color 100ms;
    outline: solid 8px transparent;
  }

  &:hover &__thumb {
    outline-color: #27272732;
  }

  &:active &__thumb {
    outline-color: #2727276a;
  }

  &.active &__thumb {
    background-color: #f5f5f5;
    left: calc(100% - $h + $inset);
  }
}
</style>
