<script setup lang="ts">
import { computed } from "vue"
import Color from "color"

import { ApiCardPack } from "@backend/types"

import AppChip from "../../AppChip.vue"
import defaultIcon from "../../../assets/white-card-icon.svg?raw"

const props = defineProps<{ pack: ApiCardPack; selected?: boolean }>()

defineEmits(["click"])

const packColor = computed(() => {
  const color = props.pack.color
  const selected = props.selected

  if (color) {
    if (selected) return color
    const parsedColor = Color(color)

    if (parsedColor.luminosity() < 0.1) {
      return parsedColor.lighten(0.9).hex()
    } else {
      return color
    }
  } else {
    return "white"
  }
})

const packIcon = computed(() => {
  return props.pack.icon || defaultIcon
})
</script>

<template>
  <AppChip
    @click="$emit('click')"
    :color="packColor"
    :style="{ '--pack-color': packColor }"
    :class="{ selected }"
    :outlined="!selected"
    class="pack"
  >
    <div
      class="pack__icon"
      :class="{
        'pack__icon--colored-icon': pack.icon && pack.color,
        'pack__icon--only-colored': pack.color && !pack.icon
      }"
      v-html="packIcon"
    ></div>
    {{ pack.name }}
  </AppChip>
</template>

<style scoped lang="scss">
.pack {
  transition: all 100ms;

  &__icon {
    :deep(svg) {
      display: block;
      width: 16px;
      height: 16px;
    }

    &--colored-icon :deep(svg) {
      *[fill="white"] {
        fill: #3a3a3a;
      }

      *[fill="black"] {
        fill: var(--pack-color);
      }
    }

    &--only-colored :deep(svg) {
      *[fill="white"] {
        fill: currentColor;
      }
    }
  }

  &.selected &__icon {
    :deep(svg) {
      *[fill="white"] {
        fill: black;
      }
    }

    &--colored-icon :deep(svg) {
      *[fill="white"] {
        fill: var(--pack-color);
      }

      *[fill="black"] {
        fill: currentColor;
      }
    }

    &--only-colored :deep(svg) {
      *[fill="white"] {
        fill: currentColor;
      }
    }
  }
}
</style>
