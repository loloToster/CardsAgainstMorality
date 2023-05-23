<script setup lang="ts">
import AppModalBase from "@/components/AppModalBase.vue"

defineProps<{ title?: string; transparent?: boolean }>()

defineEmits(["close"])
</script>

<template>
  <AppModalBase @close="$emit('close')">
    <div class="modal" :class="{ 'modal--transparent': transparent }">
      <h1 v-if="title">{{ title }}</h1>
      <button @click="$emit('close')" class="modal__close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
          />
        </svg>
      </button>
      <div class="modal__content">
        <slot></slot>
      </div>
    </div>
  </AppModalBase>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.modal {
  position: relative;
  max-width: 96vw;
  padding: 22px;
  border-radius: 12px;
  background-color: colors.$light-surface;

  &--transparent {
    background-color: transparent;
  }

  h1 {
    margin-bottom: 12px;
  }

  &__close {
    position: absolute;
    top: 6px;
    right: 6px;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
      fill: white;
    }
  }
}
</style>
