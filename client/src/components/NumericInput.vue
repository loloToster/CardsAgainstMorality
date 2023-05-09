<script setup lang="ts">
import { reactive, watch } from "vue"

const props = withDefaults(
  defineProps<{
    modelValue: number
    lowest?: number
    highest?: number
    step?: number
  }>(),
  {
    step: 1
  }
)

const emit = defineEmits<{
  (ev: "update:modelValue", newVal: number): void
}>()

const state = reactive({
  val: props.modelValue,
  invalid: props.modelValue === undefined,
  toLow: false,
  toBig: false
})

watch(
  () => state.val,
  newVal => {
    if (typeof newVal !== "number" || newVal % props.step) {
      state.invalid = true
      emit("update:modelValue", NaN)
      return
    }

    state.invalid = false
    if (props.lowest !== undefined) state.toLow = props.lowest > newVal
    if (props.highest !== undefined) state.toBig = props.highest < newVal

    emit("update:modelValue", state.toLow || state.toBig ? NaN : newVal)
  }
)
</script>

<template>
  <div class="inp">
    <div
      v-if="lowest !== undefined"
      class="inp__limit"
      :class="{ invalid: state.toLow, inactive: state.invalid }"
    >
      <span>{{ lowest }}</span>
      <span> &le;</span>
    </div>
    <input
      type="number"
      v-model="state.val"
      :step="step"
      :class="{ invalid: state.invalid }"
    />
    <div
      v-if="highest !== undefined"
      class="inp__limit"
      :class="{ invalid: state.toBig, inactive: state.invalid }"
    >
      <span>&le; </span>
      <span v-if="isFinite(highest)">{{ highest }}</span>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>infinity</title>
        <path
          d="M18.6,6.62C21.58,6.62 24,9 24,12C24,14.96 21.58,17.37 18.6,17.37C17.15,17.37 15.8,16.81 14.78,15.8L12,13.34L9.17,15.85C8.2,16.82 6.84,17.38 5.4,17.38C2.42,17.38 0,14.96 0,12C0,9.04 2.42,6.62 5.4,6.62C6.84,6.62 8.2,7.18 9.22,8.2L12,10.66L14.83,8.15C15.8,7.18 17.16,6.62 18.6,6.62M7.8,14.39L10.5,12L7.84,9.65C7.16,8.97 6.31,8.62 5.4,8.62C3.53,8.62 2,10.13 2,12C2,13.87 3.53,15.38 5.4,15.38C6.31,15.38 7.16,15.03 7.8,14.39M16.2,9.61L13.5,12L16.16,14.35C16.84,15.03 17.7,15.38 18.6,15.38C20.47,15.38 22,13.87 22,12C22,10.13 20.47,8.62 18.6,8.62C17.69,8.62 16.84,8.97 16.2,9.61Z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.inp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  padding-bottom: 4px;

  &__limit {
    display: flex;
    transition: color 150ms;
    height: 1rem;
    gap: 6px;

    svg {
      margin-top: -3px;
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    &.invalid {
      color: colors.$danger;
      font-weight: bold;
    }

    &.inactive {
      color: colors.$inp;
    }
  }

  input {
    position: relative;
    appearance: textfield;
    -moz-appearance: textfield;
    padding: 0;
    margin: 0;
    outline: none;
    border: none;
    border-bottom: 2px colors.$lightgray solid;
    font-size: inherit;
    width: 6ch;
    text-align: center;
    transform: translateY(2%);
    transition: all 150ms;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &.invalid {
      border-color: colors.$danger;
    }
  }
}
</style>
