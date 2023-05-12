<script setup lang="ts">
import { reactive, watch } from "vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
  }>(),
  { disabled: false }
)

const state = reactive({
  val: false
})

const emit = defineEmits<{
  (ev: "update:modelValue", newVal: boolean): void
}>()

function onChange() {
  if (props.disabled) return false

  state.val = !state.val
  emit("update:modelValue", state.val)
}

watch(
  () => props.modelValue,
  newVal => {
    state.val = newVal
  }
)
</script>

<template>
  <div
    @click="onChange"
    :class="{ active: state.val, disabled }"
    class="switch"
    role="checkbox"
    :aria-checked="state.val"
  >
    <div class="switch__thumb"></div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math" as math;
@use "@/styles/colors" as colors;

$h: 24px;
$w: 48px;
$inset: 3px;
$hover-size: 34px;

.switch {
  position: relative;
  height: $h;
  width: $w;
  border-radius: 100vh;
  background-color: colors.$inp-bg;
  cursor: pointer;
  transition: background-color 100ms;

  &.active {
    background-color: colors.$lime;
  }

  &.disabled {
    cursor: not-allowed;
  }

  &__thumb {
    $size: $h - (2 * $inset);

    position: absolute;
    top: $inset;
    left: $inset;
    height: $size;
    width: $size;
    background-color: colors.$lightgray;
    transition: inherit;
    border-radius: 50%;
    transition: left 100ms, outline-color 100ms;
    outline: solid 8px transparent;
  }

  &:hover &__thumb {
    outline-color: colors.$inp-hover;
  }

  &:active &__thumb {
    outline-color: colors.$inp-active;
  }

  &.disabled &__thumb {
    outline-color: transparent;
  }

  &.active &__thumb {
    background-color: colors.$subtext;
    left: calc(100% - $h + $inset);
  }
}
</style>
