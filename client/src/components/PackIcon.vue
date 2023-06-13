<script setup lang="ts">
import { reactive, watch } from "vue"

import { CUSTOM_ICONS_BASE_URL } from "@/consts"
import api from "@/utils/api"
import defaultIcon from "@/assets/black-card-icon.svg?raw"

const props = defineProps<{ icon?: string | null }>()

const state = reactive({
  svg: defaultIcon
})

function updateSvg() {
  if (props.icon?.trimStart().startsWith("<svg")) {
    state.svg = props.icon
  } else if (props.icon && props.icon.length > 0) {
    api.get(`${CUSTOM_ICONS_BASE_URL}${props.icon}.svg`).then(res => {
      state.svg = (res.data as string).replaceAll("<path", "<path fill='black'")
    })
  }
}

updateSvg()
watch(() => props.icon, updateSvg)
</script>

<template>
  <div v-html="state.svg"></div>
</template>
