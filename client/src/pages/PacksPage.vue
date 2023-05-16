<script setup lang="ts">
import { reactive, ref } from "vue"
import { RouterLink } from "vue-router"
import { onClickOutside } from "@vueuse/core"

import { ApiCardPack } from "@backend/types"

import AppLoading from "@/components/AppLoading.vue"
import AppButton from "@/components/AppButton.vue"
import CardPack from "@/components/CardPack.vue"

const SORT_TYPES = {
  likes: "Likes",
  cards: "Number of Cards",
  blacks: "Number of Black Cards",
  whites: "Number of White Cards"
}

type SortType = keyof typeof SORT_TYPES

const state = reactive<{
  searchQuery: string
  sortBy: null | SortType
  searchAdditionalActive: boolean
  sortDropdownActive: boolean
  loading: boolean
  packs: ApiCardPack[]
}>({
  searchQuery: "",
  sortBy: null,
  searchAdditionalActive: false,
  sortDropdownActive: false,
  loading: true,
  packs: []
})

fetch("/api/packs").then(async res => {
  if (res.ok) {
    const { packs } = await res.json()
    state.packs = packs
    state.loading = false
  }
})

function handleSort(sortType: SortType) {
  state.sortDropdownActive = false

  if (state.sortBy === sortType) {
    state.sortBy = null
  } else {
    state.sortBy = sortType
  }
}

const searchInputWrapper = ref<HTMLDivElement>()
const searchQueryInput = ref<HTMLInputElement>()

function handleInputWrapperClick() {
  if (!state.searchAdditionalActive) {
    state.searchAdditionalActive = true
    searchQueryInput.value?.focus()
  }
}

onClickOutside(searchInputWrapper, () => {
  state.searchAdditionalActive = false
})

const sortSection = ref<HTMLDivElement>()

onClickOutside(sortSection, () => {
  state.sortDropdownActive = false
})
</script>

<template>
  <div class="packs-page">
    <div class="search">
      <div
        @click="handleInputWrapperClick"
        ref="searchInputWrapper"
        class="search__input-wrapper"
        :class="{ active: state.searchAdditionalActive }"
      >
        <div class="search__main-input">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M795.761 941.696 531.326 677.5q-29.761 25.264-69.6 39.415-39.84 14.15-85.161 14.15-109.835 0-185.95-76.195Q114.5 578.674 114.5 471t76.196-183.87q76.195-76.195 184.369-76.195t183.87 76.195q75.695 76.196 75.695 184.02 0 43.328-13.641 82.97-13.641 39.641-40.924 74.402L845.5 891.957l-49.739 49.739ZM375.65 662.935q79.73 0 135.29-56.245Q566.5 550.446 566.5 471t-55.595-135.69q-55.595-56.245-135.255-56.245-80.494 0-136.757 56.245Q182.63 391.554 182.63 471t56.228 135.69q56.227 56.245 136.792 56.245Z"
            />
          </svg>
          <input
            v-model="state.searchQuery"
            ref="searchQueryInput"
            class="search__input"
            type="search"
            placeholder="Search through packs"
          />
          <button
            v-if="state.searchQuery"
            @click="state.searchQuery = ''"
            class="search__clear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
              <path
                d="M249 854.739 201.261 807l231-231-231-231L249 297.261l231 231 231-231L758.739 345l-231 231 231 231L711 854.739l-231-231-231 231Z"
              />
            </svg>
          </button>
        </div>
        <div v-if="state.searchAdditionalActive" class="search__additional">
          todo: tags, bundles, types
        </div>
      </div>
      <div ref="sortSection" class="search__sort">
        <button
          @click="state.sortDropdownActive = !state.sortDropdownActive"
          class="search__sort__open"
          :class="{ open: state.sortDropdownActive, active: state.sortBy }"
        >
          <span v-if="state.sortBy">
            Sort by: {{ SORT_TYPES[state.sortBy] }}
          </span>
          <span v-else>Sort</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path d="M480 696 280 497h400L480 696Z" />
          </svg>
        </button>
        <div v-if="state.sortDropdownActive" class="search__sort-dropdown">
          <AppButton
            v-for="(value, key) in SORT_TYPES"
            @click="handleSort(key)"
            class="search__sort-dropdown__btn"
            :class="{ active: key === state.sortBy }"
            :key="key"
          >
            {{ value }}
          </AppButton>
        </div>
      </div>
    </div>
    <AppLoading v-if="state.loading">Loading packs</AppLoading>
    <div v-else-if="state.packs.length" class="packs">
      <RouterLink
        v-for="pack in state.packs"
        :to="`/pack/${encodeURIComponent(pack.name)}`"
        class="packs__pack"
        :style="{ '--pack-color': pack.color ?? undefined }"
        :key="pack.id"
      >
        <CardPack :icon="pack.icon ?? undefined">{{ pack.name }}</CardPack>
      </RouterLink>
    </div>
    <div v-else>No packs matching your criteria</div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as vars;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.packs-page {
  isolation: isolate;
  width: 100%;
}

.search {
  $gap: 8px;
  $roundness: 6px;

  position: sticky;
  top: calc(vars.$header-height + 20px);
  z-index: 1;

  display: flex;
  gap: $gap;
  width: 90%;
  max-width: 1100px;
  margin: auto;
  margin-top: 20px;
  font-size: 1.1rem;

  svg {
    fill: currentColor;
  }

  @mixin search-surface() {
    background-color: colors.$inp-bg;
    border-radius: $roundness;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  &__input-wrapper {
    @include search-surface();

    position: relative;
    flex-grow: 1;
    min-width: 0;
    display: flex;
    align-items: center;

    &.active {
      border-radius: $roundness $roundness 0 0;
    }
  }

  &__main-input {
    display: flex;
    gap: 6px;
    padding: 8px 14px;
    width: 100%;

    svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    input {
      flex-grow: 1;
      min-width: 0;
      font-size: inherit;

      &::placeholder {
        color: #757575;
      }

      &::-webkit-search-decoration,
      &::-webkit-search-cancel-button,
      &::-webkit-search-results-button,
      &::-webkit-search-results-decoration {
        -webkit-appearance: none;
      }
    }
  }

  &__additional {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding: 8px 14px;
    background-color: colors.$inp-bg;
    border-radius: 0 0 $roundness $roundness;

    // !
    height: 40vh;
  }

  &__sort {
    position: relative;
    white-space: nowrap;

    &__open {
      @include search-surface();

      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      padding-right: 6px;
      font-size: inherit;
      cursor: pointer;

      &.active {
        $outline: 2px;
        outline: $outline colors.$primary solid;
        outline-offset: -$outline;
        background-color: darken(colors.$primary, 10%);
      }

      svg {
        width: 24px;
        height: 24px;
        transition: transform 300ms;
      }

      &.open svg {
        transform: rotate(180deg);
      }
    }
  }

  &__sort-dropdown {
    @include search-surface();

    display: flex;
    flex-direction: column;
    gap: 6px;
    position: absolute;
    right: 0;
    top: calc(100% + $gap);
    padding: 6px;

    &__btn {
      --color: transparent;
      text-align: start;

      &.active {
        --color: unset;
      }
    }
  }
}

.packs {
  --items-in-row: 4;

  @include mixins.sm {
    --items-in-row: 3;
  }

  @include mixins.xs {
    --items-in-row: 2;
  }

  display: grid;
  grid-template-columns: repeat(var(--items-in-row), 1fr);
  grid-auto-rows: 1fr;
  gap: 3vw;
  width: 90%;
  max-width: 1100px;
  margin: 30px auto;

  &__pack {
    display: block;
    width: 100%;
    text-decoration: none;
    color: inherit;
    font-size: 1.3rem;
    transition: transform 100ms;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
