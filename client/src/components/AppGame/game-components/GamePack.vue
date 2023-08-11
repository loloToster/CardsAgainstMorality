<script setup lang="ts">
import { reactive, computed } from "vue"
import { Dropdown } from "floating-vue"
import Color from "color"

import type { ApiCardPack } from "@backend/types"

import AppChip from "@/components/AppChip.vue"
import PackIcon from "@/components/PackIcon.vue"

const props = withDefaults(
  defineProps<{
    pack: ApiCardPack
    selectedWhites?: boolean
    selectedBlacks?: boolean
    disabled?: boolean
  }>(),
  {
    selectedWhites: false,
    selectedBlacks: false,
    disabled: false
  }
)

const state = reactive<{ detailsOpen: boolean }>({
  detailsOpen: false
})

const emit = defineEmits(["click", "only-blacks", "only-whites"])

function handleClick() {
  if (props.disabled) return
  emit("click")
}

function handleDetailsOpen() {
  state.detailsOpen = true
}

function handleOnlyBlacks() {
  state.detailsOpen = false
  emit("only-blacks")
}

function handleOnlyWhites() {
  state.detailsOpen = false
  emit("only-whites")
}

const selected = computed(() => {
  return props.selectedBlacks || props.selectedWhites
})

const packColor = computed(() => {
  const color = props.pack.color

  if (color) {
    if (selected.value) return color
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

const light = computed(() => {
  return Color(packColor.value).isLight()
})
</script>

<template>
  <Dropdown
    @hide="state.detailsOpen = false"
    :shown="state.detailsOpen"
    :triggers="[]"
    :distance="4"
    class="pack-wrapper"
    :style="{ '--pack-color': packColor }"
  >
    <AppChip
      @click="handleClick"
      :color="packColor"
      :class="{ selected, disabled }"
      :outlined="!selected"
      class="pack"
    >
      <PackIcon
        :icon="pack.icon"
        class="pack__icon"
        :class="{
          'pack__icon--colored-icon': pack.icon && pack.color,
          'pack__icon--only-colored': pack.color && !pack.icon
        }"
      />
      {{ pack.name }}
    </AppChip>
    <button
      v-if="!state.detailsOpen"
      @click="handleDetailsOpen"
      class="pack-wrapper__more"
    >
      ...
    </button>
    <div
      v-if="selectedBlacks !== selectedWhites"
      class="pack-wrapper__partial-select"
      :class="{
        'pack-wrapper__partial-select--black': selectedBlacks,
        'pack-wrapper__partial-select--white': selectedWhites
      }"
    >
      <div></div>
    </div>

    <template #popper>
      <div
        class="details"
        :class="{ 'details--light': light }"
        :style="{ '--pack-color': packColor }"
      >
        <button @click="state.detailsOpen = false" class="details__close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="m291-208-83-83 189-189-189-189 83-83 189 189 189-189 83 83-189 189 189 189-83 83-189-189-189 189Z"
            />
          </svg>
        </button>
        <h4>{{ pack.name }}</h4>
        <div class="details__meta">
          <div>♥ {{ pack.likedBy }}</div>
          <div v-if="pack.numOfBlacks">{{ pack.numOfBlacks }} blacks</div>
          <div v-if="pack.numOfWhites">{{ pack.numOfWhites }} whites</div>
        </div>
        <div v-if="!disabled" class="details__only">
          <button
            @click="handleOnlyBlacks"
            class="details__only__btn details__only__btn--blacks"
          >
            Only Blacks
          </button>
          <button
            @click="handleOnlyWhites"
            class="details__only__btn details__only__btn--whites"
          >
            Only Whites
          </button>
        </div>
        <a
          :href="`/pack/${encodeURIComponent(pack.id)}`"
          class="details__view-cards"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>View Cards</button>
        </a>
      </div>
    </template>
  </Dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.pack-wrapper {
  position: relative;
  max-width: 100%;

  &__more {
    display: none;
    position: absolute;
    background-color: colors.$light-surface;
    top: 100%;
    right: 16px;
    z-index: 1;
    border: var(--pack-color) 2px solid;
    border-top-width: 0;
    border-radius: 0 0 3px 3px;
    line-height: 0.4;
    color: var(--pack-color);
    font-size: 16px;
    padding: 6px 4px;
    padding-top: 0;
    cursor: pointer;
    font-weight: 600;
  }

  &:hover &__more {
    display: block;
  }

  &__partial-select {
    position: absolute;
    top: 0;
    right: 12px;
    border: 3px solid colors.$light-surface;
    border-top-color: transparent;
    border-radius: 50%;
    transform: translateY(-40%);

    div {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    &--black div {
      background-color: black;
    }

    &--white div {
      background-color: white;
    }
  }
}

.pack {
  transition: all 100ms;
  cursor: default;
  max-width: 100%;
  overflow: hidden;

  &.disabled {
    cursor: not-allowed;
  }

  &__icon {
    :deep(svg) {
      display: block;
      width: 16px;
      height: 16px;

      *[fill="black"] {
        fill: white;
      }
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
      *[fill="black"] {
        fill: currentColor;
      }
    }
  }

  &.selected &__icon {
    :deep(svg) {
      *[fill="black"] {
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

.details {
  --color: white;

  position: relative;
  display: flex;
  gap: 4px;
  flex-direction: column;
  padding: 8px;
  color: var(--color);
  background-color: var(--pack-color);

  &--light {
    --color: black;
  }

  h4 {
    padding-right: 16px;
  }

  svg {
    fill: var(--color);
  }

  &__close {
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__meta {
    display: flex;
    font-size: 0.8rem;
    padding-right: 16px;

    & > * {
      &::before {
        content: "•";
        margin: 0 4px;
      }

      &:first-child::before {
        content: "";
        margin: 0;
      }
    }
  }

  &__only {
    display: flex;
    gap: 4px;

    &__btn {
      min-width: 0;
      flex-grow: 1;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.8rem;
      padding: 3px 5px;
      cursor: pointer;

      &--whites {
        background-color: white;
        color: black;
      }

      &--blacks {
        background-color: black;
        color: white;
      }
    }
  }

  &__view-cards {
    display: block;

    button {
      background-color: var(--color);
      color: var(--pack-color);
      width: 100%;
      padding: 4px 0;
      border-radius: 6px;
      cursor: pointer;
    }
  }
}
</style>
