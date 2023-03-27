<script setup lang="ts">
import { computed } from "vue"

import { ApiCardPack } from "@backend/types"

import SimpleChip from "./SimpleChip.vue"
import defaultIcon from "../assets/white-card-icon.svg?raw"

const props = defineProps<{ pack: ApiCardPack; closable?: boolean }>()

defineEmits(["click"])

const packColor = computed(() => {
  return props.pack.color || "black"
})

const packIcon = computed(() => {
  return props.pack.icon || defaultIcon
})
</script>

<template>
  <SimpleChip
    @click="$emit('click')"
    :color="packColor"
    :style="{ '--pack-color': packColor }"
    class="pack"
  >
    <div
      class="pack__icon"
      :class="{ 'pack__icon--not-default': Boolean(pack.icon) }"
      v-html="packIcon"
    ></div>
    {{ pack.name }}
    <svg
      v-if="closable"
      class="pack__close"
      xmlns="http://www.w3.org/2000/svg"
      height="14"
      viewBox="0 96 960 960"
      width="14"
    >
      <path
        d="m291 848-83-83 189-189-189-189 83-83 189 189 189-189 83 83-189 189 189 189-83 83-189-189-189 189Z"
      />
    </svg>
  </SimpleChip>
</template>

<style scoped lang="scss">
.pack {
  &__close {
    fill: currentColor;
    width: 14px;
    height: 14px;
  }

  &__icon {
    :deep(svg) {
      display: block;
      width: 16px;
      height: 16px;
    }

    &--not-default :deep(svg) {
      *[fill="white"] {
        fill: var(--pack-color);
      }

      *[fill="black"] {
        fill: currentColor;
      }
    }
  }
}
</style>
