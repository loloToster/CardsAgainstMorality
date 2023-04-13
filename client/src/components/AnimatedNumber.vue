<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue"

const props = defineProps<{ value: number }>()

const state = reactive({ number: props.value })

let timeout: ReturnType<typeof setTimeout> | undefined

function animate() {
  clearTimeout(timeout)
  if (state.number === props.value) return

  const diff = props.value - state.number
  const offset = Math.abs(diff) > 300 ? 100 : Math.abs(diff) > 30 ? 10 : 1 // make animation faster if the diff is high enough

  if (diff > 0) {
    state.number += offset
  } else {
    state.number -= offset
  }

  timeout = setTimeout(animate, 1)
}

onMounted(animate)
watch(() => props.value, animate)

onUnmounted(() => {
  clearTimeout(timeout)
})
</script>

<template>
  <div>
    {{ state.number }}
  </div>
</template>

<style scoped lang="scss"></style>
