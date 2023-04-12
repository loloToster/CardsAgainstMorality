<script setup lang="ts">
import { reactive, watch } from "vue"

const props = withDefaults(
  defineProps<{
    modelValue: number
    lowest?: number
    highest?: number
    step?: number
  }>(),
  { step: 1 }
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
    if (props.lowest !== undefined) state.toLow = props.lowest >= newVal
    if (props.highest !== undefined) state.toBig = props.highest <= newVal

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
      {{ lowest }} &lt;
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
      &lt; {{ highest }}
    </div>
  </div>
</template>

<style scoped lang="scss">
$invalid-color: #dc0833;

.inp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  padding-bottom: 4px;

  &__limit {
    transition: color 150ms;
    height: 1rem;

    &.invalid {
      color: $invalid-color;
      font-weight: bold;
    }

    &.inactive {
      color: #6a6a6a;
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
    border-bottom: 2px gray solid;
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
      border-color: $invalid-color;
    }
  }
}
</style>
