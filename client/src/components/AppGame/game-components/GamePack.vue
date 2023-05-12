<script setup lang="ts">
import { computed } from "vue"
import Color from "color"

import { ApiCardPack } from "@backend/types"

import AppChip from "@/components/AppChip.vue"
import defaultIcon from "@/assets/white-card-icon.svg?raw"

const props = withDefaults(
  defineProps<{
    pack: ApiCardPack
    selected?: boolean
    disabled?: boolean
  }>(),
  {
    selected: false,
    disabled: false
  }
)

const emit = defineEmits(["click"])

function handleClick() {
  if (props.disabled) return
  emit("click")
}

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
    @click="handleClick"
    :color="packColor"
    :style="{ '--pack-color': packColor }"
    :class="{ selected, disabled }"
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
@use "@/styles/colors" as colors;

.pack {
  transition: all 100ms;

  &.disabled {
    cursor: not-allowed;
  }

  &__icon {
    :deep(svg) {
      display: block;
      width: 16px;
      height: 16px;
    }

    &--colored-icon :deep(svg) {
      *[fill="white"] {
        fill: colors.$light-surface;
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
