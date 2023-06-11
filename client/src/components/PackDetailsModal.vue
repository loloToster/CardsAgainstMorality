<script setup lang="ts">
import { reactive, ref } from "vue"
import { watchDebounced } from "@vueuse/core"
import { Dropdown } from "floating-vue"

import api from "@/utils/api"
import { CUSTOM_ICONS_BASE_URL } from "@/consts"
import { notify } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"

import defaultIcon from "@/assets/white-card-icon.svg?url"

export interface Details {
  name: string
  color?: string
  icon?: string
}

const props = defineProps<{ initialDetails: Details }>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save", details: Details): void
}>()

const state = reactive<{
  name: string
  color: string
  icon: string | undefined
  iconsOpen: boolean
  iconSearchQuery: string
  icons: string[]
}>({
  name: props.initialDetails.name,
  color: props.initialDetails.color ?? "#ffffff",
  icon: props.initialDetails.icon,
  iconsOpen: false,
  iconSearchQuery: "",
  icons: []
})

const colorInput = ref<HTMLInputElement>()

function handleColorChange(e: Event) {
  state.color = (e.target as HTMLInputElement).value
}

async function fetchIcons() {
  try {
    const res = await api.get(
      "/api/packs/icons?q=" + encodeURIComponent(state.iconSearchQuery)
    )

    state.icons = res.data.icons
  } catch (err) {
    console.error(err)
    notify({
      type: "error",
      text: "Failed to fetch icons"
    })
  }
}

fetchIcons()
watchDebounced(() => state.iconSearchQuery, fetchIcons, { debounce: 500 })

function selectIcon(name: string) {
  state.icon = name
  state.iconsOpen = false
}

async function save() {
  emit("save", {
    name: state.name,
    color: state.color,
    icon: state.icon
  })
}
</script>

<template>
  <AppModal @close="$emit('close')" title="Edit details">
    <div class="details-modal">
      <div class="details-modal__row">
        <input
          v-model="state.name"
          class="details-modal__name"
          type="text"
          placeholder="Name"
        />
      </div>
      <div class="details-modal__row details-modal__single-opt-row">
        <span> Color: </span>
        <button
          @click="colorInput?.click()"
          :style="{ '--color': state.color }"
          class="details-modal__color"
        >
          <input
            @input="handleColorChange"
            :value="state.color"
            ref="colorInput"
            type="color"
          />
        </button>
      </div>
      <div class="details-modal__row details-modal__single-opt-row">
        <span> Icon: </span>
        <Dropdown
          @hide="state.iconsOpen = false"
          :shown="state.iconsOpen"
          :triggers="[]"
          :distance="4"
          placement="bottom-start"
        >
          <button
            @click="state.iconsOpen = true"
            :style="{ '--color': state.color }"
            class="details-modal__icon"
          >
            <img
              v-if="state.icon"
              :src="`${CUSTOM_ICONS_BASE_URL}${state.icon}.svg`"
              class="custom"
            />
            <img v-else :src="defaultIcon" />
          </button>
          <template #popper>
            <div class="icons">
              <input
                v-model="state.iconSearchQuery"
                type="text"
                placeholder="Search for icons"
              />
              <div v-if="state.icons.length" class="icons__results">
                <button
                  v-for="icon in state.icons"
                  @click="selectIcon(icon)"
                  class="icons__icon"
                  :key="icon"
                >
                  <img
                    :src="`${CUSTOM_ICONS_BASE_URL}${icon}.svg`"
                    :alt="icon"
                    :title="icon"
                  />
                </button>
              </div>
              <div v-else class="icons__no-icon">No icons found</div>
            </div>
          </template>
        </Dropdown>
      </div>
      <div class="details-modal__row">
        <AppButton @click="save" class="details-modal__save"> Save </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

@mixin text-input {
  background-color: colors.$inp-bg;
  border-radius: 4px;

  &:focus {
    outline: 1px solid colors.$inp;
  }
}

.details-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__row {
    display: flex;
  }

  &__name {
    @include text-input();

    font-size: 1.2rem;
    width: 100%;
    min-width: 32ch;
    height: 46px;
    padding: 0 12px;
  }

  &__single-opt-row {
    align-items: center;
    gap: 6px;
    font-weight: bold;
    font-size: 0.9rem;

    button {
      height: 24px;
      width: 24px;
      cursor: pointer;
    }
  }

  &__color {
    position: relative;
    background-color: var(--color);
    border: 1px solid colors.$inp;
    border-radius: 50%;

    input {
      position: absolute;
      bottom: -4px;
      left: 0;
      appearance: none;
      width: 0;
      height: 0;
      border: none;
      outline: none;

      &::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      &::-webkit-color-swatch {
        border: none;
      }
    }
  }

  &__icon {
    img {
      width: 100%;
      height: 100%;

      &.custom {
        filter: invert(1);
      }
    }
  }

  &__save {
    margin-left: auto;
  }
}

.icons {
  width: 80vw;
  max-width: 280px;
  padding: 8px;
  background-color: colors.$darkgray;

  input {
    @include text-input();

    width: 100%;
    font-size: 0.875rem;
    height: 26px;
    padding: 0 10px;
    margin-bottom: 12px;
  }

  &__results {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }

  &__icon {
    filter: invert(1);
  }

  &__no-icon {
    width: 100%;
    color: white;
    text-align: center;
    padding: 30px 0;
  }
}
</style>
