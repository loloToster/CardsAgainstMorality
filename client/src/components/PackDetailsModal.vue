<script setup lang="ts">
import { reactive, ref } from "vue"
import { watchDebounced } from "@vueuse/core"
import { Dropdown } from "floating-vue"

import type {
  ApiCardPackRichEditableDetails,
  ApiCardPackEditableDetails,
  ApiCardPack,
  SearchCriteria,
  ApiCardPackType,
  ApiCardPackTag
} from "@backend/types"

import { MAX_PACK_TAGS } from "@backend/consts"
import { CUSTOM_ICONS_BASE_URL } from "@/consts"

import api from "@/utils/api"
import { notify } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"
import AppChip from "@/components/AppChip.vue"
import AppSwitch from "@/components/AppSwitch.vue"

import defaultIcon from "@/assets/white-card-icon.svg?url"

const props = defineProps<{ pack: ApiCardPack }>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save", details: ApiCardPackRichEditableDetails): void
}>()

const state = reactive<{
  name: string
  private: boolean
  types: ApiCardPackType[]
  selectedType: number
  tags: ApiCardPackTag[]
  selectedTags: number[]
  color: string
  icon: string | undefined
  iconsOpen: boolean
  iconSearchQuery: string
  icons: string[]
}>({
  name: props.pack.name,
  private: props.pack.private,
  selectedType: props.pack.type.id,
  types: [],
  selectedTags: props.pack.tags.map(t => t.id),
  tags: [],
  color: props.pack.color ?? "#ffffff",
  icon: props.pack.icon ?? undefined,
  iconsOpen: false,
  iconSearchQuery: "",
  icons: []
})

api.get("/api/packs/search-criteria").then(res => {
  const criteria: SearchCriteria = res.data

  state.types = criteria.types
  state.tags = criteria.tags
})

function handleTypeClick(typ: number) {
  state.selectedType = typ
}

function handleTagClick(tag: number) {
  const lengthBeforeFilter = state.selectedTags.length
  state.selectedTags = state.selectedTags.filter(t => t !== tag)

  if (state.selectedTags.length < lengthBeforeFilter) return
  if (state.selectedTags.length >= MAX_PACK_TAGS) return

  state.selectedTags.push(tag)
}

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
  const details: ApiCardPackEditableDetails = {
    name: state.name,
    private: state.private,
    type: state.selectedType,
    tags: state.selectedTags,
    color: state.color,
    icon: state.icon
  }

  const richType = state.types.find(tp => tp.id === state.selectedType)

  // should always be true
  if (richType)
    emit("save", {
      ...details,
      tags: state.tags.filter(t => state.selectedTags.some(st => st === t.id)),
      type: richType
    })

  try {
    await api.post(`/api/pack/${props.pack.id}/details`, details)

    notify({
      type: "success",
      text: "Successfully saved the details"
    })
  } catch (err) {
    notify({
      type: "error",
      text: "Failed to save the details"
    })
  }
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
        <h2>Private:</h2>
        <AppSwitch v-model="state.private" />
      </div>
      <div class="details-modal__row">
        <h2>Type</h2>
        <div class="details-modal__row__chips">
          <AppChip
            v-for="typ in state.types"
            @click="handleTypeClick(typ.id)"
            :outlined="state.selectedType !== typ.id"
            :key="typ.id"
          >
            {{ typ.name }}
          </AppChip>
        </div>
      </div>
      <div class="details-modal__row">
        <h2>
          Tags
          <span>{{ state.selectedTags.length }}/{{ MAX_PACK_TAGS }}</span>
        </h2>
        <div class="details-modal__row__chips">
          <AppChip
            v-for="tag in state.tags"
            @click="handleTagClick(tag.id)"
            :outlined="!state.selectedTags.includes(tag.id)"
            :key="tag.id"
          >
            {{ tag.name }}
          </AppChip>
        </div>
      </div>
      <div class="details-modal__row details-modal__single-opt-row">
        <h2>Color:</h2>
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
        <h2>Icon:</h2>
        <Dropdown
          @hide="state.iconsOpen = false"
          :shown="state.iconsOpen"
          :triggers="[]"
          :distance="4"
          placement="top-start"
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
        <button v-if="state.icon" @click="state.icon = undefined">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
            ></path>
          </svg>
        </button>
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
  width: 600px;
  max-width: 100%;

  &__row {
    display: flex;
    gap: 6px;
    flex-direction: column;

    &__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
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
    flex-direction: row;
    font-weight: bold;
    font-size: 0.9rem;

    button {
      height: 24px;
      width: 24px;
      cursor: pointer;

      svg {
        fill: currentColor;
        width: 80%;
        height: 80%;
      }
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
