<script setup lang="ts">
import { computed, reactive, ref } from "vue"
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

import { MAX_PACK_TAGS, MAX_PACK_NAME_LEN, PackPrivacy } from "@backend/consts"
import { CUSTOM_ICONS_BASE_URL } from "@/consts"

import api from "@/utils/api"
import { useNotificationsStore } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"
import AppChip from "@/components/AppChip.vue"

import defaultIcon from "@/assets/white-card-icon.svg?url"

const props = defineProps<{ pack: ApiCardPack }>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save", details: ApiCardPackRichEditableDetails): void
}>()

const notifications = useNotificationsStore()

const state = reactive<{
  name: string
  privacy: string | number // might be string because of input
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
  privacy: props.pack.privacy,
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

const nameError = computed(() => {
  return !state.name.trim()
})

const privacyAsNum = computed(() => {
  return parseInt(state.privacy.toString())
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
    notifications.add({
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
    privacy: parseInt(state.privacy.toString()),
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

    notifications.add({
      type: "success",
      text: "Successfully saved the details"
    })
  } catch (err) {
    notifications.add({
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
        <div class="details-modal__name">
          <input
            v-model="state.name"
            class="details-modal__name__input"
            :class="{ error: nameError }"
            type="text"
            placeholder="Name"
            :maxlength="MAX_PACK_NAME_LEN"
          />
          <div class="details-modal__name__len">
            {{ MAX_PACK_NAME_LEN - state.name.length }}
          </div>
        </div>
      </div>
      <div class="details-modal__row">
        <h2>Privacy</h2>
        <div class="details-modal__privacy">
          <div
            class="details-modal__privacy__slider"
            :class="`details-modal__privacy__slider--${state.privacy}`"
          >
            <div></div>
            <div></div>
            <div></div>
            <input
              v-model="state.privacy"
              type="range"
              :min="PackPrivacy.Public"
              :max="PackPrivacy.Private"
            />
          </div>
          <div class="details-modal__privacy__names">
            <button
              @click="state.privacy = PackPrivacy.Public"
              :class="{ active: privacyAsNum === PackPrivacy.Public }"
            >
              Public
            </button>
            <div>
              <button
                @click="state.privacy = PackPrivacy.OnlyRoom"
                :class="{ active: privacyAsNum === PackPrivacy.OnlyRoom }"
              >
                Only room
              </button>
            </div>
            <button
              @click="state.privacy = PackPrivacy.Private"
              :class="{ active: privacyAsNum === PackPrivacy.Private }"
            >
              Private
            </button>
          </div>
          <div class="details-modal__privacy__desc">
            <span v-if="privacyAsNum === PackPrivacy.Public">
              Everyone can search up and use this pack
            </span>
            <span v-if="privacyAsNum === PackPrivacy.OnlyRoom">
              Only people in the same room as you can use this pack
            </span>
            <span v-if="privacyAsNum === PackPrivacy.Private">
              Only you can use this pack as a room leader
            </span>
            <span
              v-if="privacyAsNum !== PackPrivacy.Public"
              v-tooltip.bottom="{
                content:
                  'The metadata of the pack<br> like name and icon might still<br> be available publicly',
                html: true
              }"
              class="details-modal__privacy__warning"
            >
              ⚠
            </span>
          </div>
        </div>
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
@use "sass:math" as math;
@use "@/styles/colors" as colors;

@mixin text-input {
  background-color: colors.$inp-bg;
  border-radius: 4px;

  &:focus {
    outline: 1px solid colors.$inp;
  }

  &.error {
    outline: 1px solid colors.$error;
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
    position: relative;

    &__input {
      @include text-input();

      font-size: 1.2rem;
      width: 100%;
      min-width: 32ch;
      height: 46px;
      padding: 0 12px;
    }

    &__len {
      position: absolute;
      right: 4px;
      top: calc(100% + 4px);
      font-size: 0.875rem;
      color: colors.$lightgray;
      font-weight: bold;
    }
  }

  &__privacy {
    &__slider {
      $height: 9px;
      $thumb-size: 20px;
      $dot-size: 5px;
      $padding: math.div($height - $dot-size, 2);

      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: $height;
      padding: 0 $padding;
      margin-top: 3px;
      margin-bottom: 5px;
      border-radius: 100vh;
      transition: background-color 200ms;

      &--0 {
        --pos: 0;
        background-color: colors.$lime;
      }

      &--1 {
        --pos: calc(50% - #{math.div($thumb-size, 2)});
        background-color: colors.$warn;
      }

      &--2 {
        --pos: calc(100% - #{$thumb-size});
        background-color: colors.$danger;
      }

      &:after {
        content: "";
        position: absolute;
        top: 50%;
        left: var(--pos);
        transform: translateY(-50%);
        width: $thumb-size;
        height: $thumb-size;
        border-radius: 50%;
        background-color: colors.$lightgray;
        outline: colors.$light-surface 2.5px solid;
        transition: left 200ms;
        pointer-events: none;
      }

      div {
        height: $dot-size;
        width: $dot-size;
        background-color: colors.$light-surface;
        border-radius: 50%;
      }

      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }

    &__names {
      width: 100%;
      display: flex;
      margin-bottom: 6px;

      & > *:nth-child(2) {
        flex-grow: 1;
        text-align: center;
      }

      button {
        cursor: pointer;
        color: darken(colors.$subtext, 30%);

        &.active {
          color: colors.$subtext;
        }
      }
    }

    &__desc {
      line-height: 1.3;
      text-align: center;
    }

    &__warning {
      cursor: default;
    }
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
    overflow: hidden;

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
