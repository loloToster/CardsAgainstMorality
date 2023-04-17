<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { copyToClipboard } from "../utils"
import AppButton from "./AppButton.vue"

const SUCCESS_TIMEOUT = 2000

const props = defineProps<{ content?: string | Blob | null; color?: string }>()

const state = reactive({ success: false })

let timeout: ReturnType<typeof setTimeout> | undefined
onUnmounted(() => clearTimeout(timeout))

async function onCopy() {
  if (!props.content) return

  if (typeof props.content === "string") {
    await copyToClipboard(props.content)
  } else {
    const item = new ClipboardItem({ "image/png": props.content })
    await navigator.clipboard.write([item])
  }

  state.success = true
  timeout = setTimeout(() => (state.success = false), SUCCESS_TIMEOUT)
}
</script>
<template>
  <AppButton @click="onCopy" :color="color" class="copy-btn">
    <svg
      v-if="state.success"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>success</title>
      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
      <path
        d="M200 976q-33 0-56.5-23.5T120 896V336h80v560h440v80H200Zm160-160q-33 0-56.5-23.5T280 736V256q0-33 23.5-56.5T360 176h360q33 0 56.5 23.5T800 256v480q0 33-23.5 56.5T720 816H360Zm0-80h360V256H360v480Zm0 0V256v480Z"
      />
    </svg>
    <div><slot>Copy</slot></div>
  </AppButton>
</template>
<style scoped lang="scss">
.copy-btn {
  display: flex;
  align-items: center;
  padding: 8px;

  svg {
    fill: currentColor;
    height: 20px;
    width: 20px;
  }

  div {
    flex-grow: 1;
    font-size: 1rem;
  }
}
</style>
