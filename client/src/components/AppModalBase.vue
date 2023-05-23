<script setup lang="ts">
import { ref } from "vue"

const emit = defineEmits(["close"])

const modalBase = ref<HTMLDivElement>()

function handleClose(e: MouseEvent) {
  if (e.target === modalBase.value) emit("close")
}
</script>

<template>
  <div ref="modalBase" @click="handleClose" class="modal-base">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.modal-base {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  overflow: hidden;
  background-color: colors.$modal-bg;
}
</style>
