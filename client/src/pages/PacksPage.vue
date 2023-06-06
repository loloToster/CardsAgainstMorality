<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRouter, useRoute, RouterLink } from "vue-router"
import { onClickOutside } from "@vueuse/core"

import api from "@/utils/api"

import type {
  ApiCardPack,
  ApiCardPackType,
  ApiCardPackBundle,
  ApiCardPackTag,
  SearchCriteria,
  SortType
} from "@backend/types"

import AppLoading from "@/components/AppLoading.vue"
import AppError from "@/components/AppError.vue"
import AppButton from "@/components/AppButton.vue"
import AppChip from "@/components/AppChip.vue"
import CardPack from "@/components/CardPack.vue"

const router = useRouter()
const route = useRoute()

const SORT_TYPES: Record<SortType, string> = {
  likes: "Likes",
  cards: "Number of Cards",
  blacks: "Number of Black Cards",
  whites: "Number of White Cards"
}

function parseQueryParam(p: { toString: () => string } | undefined | null) {
  return (
    p
      ?.toString()
      .split(",")
      .map(id => parseInt(id)) ?? []
  )
}

const state = reactive<{
  searchQuery: string
  searchAdditionalActive: boolean
  types: ApiCardPackType[]
  selectedTypes: number[]
  bundles: ApiCardPackBundle[]
  selectedBundles: number[]
  tags: ApiCardPackTag[]
  selectedTags: number[]
  sortBy: null | SortType
  sortDropdownActive: boolean
  loading: boolean
  error: boolean
  packs: ApiCardPack[]
}>({
  searchQuery: route.query.q?.toString() ?? "",
  searchAdditionalActive: false,
  types: [],
  selectedTypes: parseQueryParam(route.query.types),
  bundles: [],
  selectedBundles: parseQueryParam(route.query.bundles),
  tags: [],
  selectedTags: parseQueryParam(route.query.tags),
  sortBy: (route.query.sort?.toString() as SortType) ?? null,
  sortDropdownActive: false,
  loading: true,
  error: false,
  packs: []
})

let packController: AbortController | undefined

async function fetchPacks() {
  state.loading = true

  packController?.abort()

  const queryParams: Record<string, string> = {}

  if (state.searchQuery) queryParams.q = state.searchQuery

  const selectedTypes = state.selectedTypes.join(",")
  if (selectedTypes) queryParams.types = selectedTypes

  const selectedBundles = state.selectedBundles.join(",")
  if (selectedBundles) queryParams.bundles = selectedBundles

  const selectedTags = state.selectedTags.join(",")
  if (selectedTags) queryParams.tags = selectedTags

  if (state.sortBy) queryParams.sort = state.sortBy

  router.push({ path: "/packs", query: queryParams })

  const parsedQuery = Object.keys(queryParams)
    .map(key => key + "=" + encodeURIComponent(queryParams[key]))
    .join("&")

  packController = new AbortController()

  try {
    state.error = false
    const res = await api.get("/api/packs?" + parsedQuery, {
      signal: packController.signal
    })

    state.packs = res.data.packs
  } catch (err) {
    console.error(err)
    state.error = true
  }

  state.loading = false
}

api.get("/api/packs/search-criteria").then(res => {
  const criteria: SearchCriteria = res.data

  state.types = criteria.types
  state.bundles = criteria.bundles
  state.tags = criteria.tags
})

fetchPacks()

function handleSearch() {
  state.searchAdditionalActive = false
  fetchPacks()
}

function handleMainInputKeypress(e: KeyboardEvent) {
  if (e.key !== "Enter") return
  handleSearch()
}

function handleSort(sortType: SortType) {
  state.sortDropdownActive = false

  if (state.sortBy === sortType) {
    state.sortBy = null
  } else {
    state.sortBy = sortType
  }

  fetchPacks()
}

const searchInputWrapper = ref<HTMLDivElement>()
const searchQueryInput = ref<HTMLInputElement>()

function handleMainInputClick() {
  if (!state.searchAdditionalActive) {
    state.searchAdditionalActive = true
    searchQueryInput.value?.focus()
  }
}

function handleClear() {
  state.searchQuery = ""
  searchQueryInput.value?.focus()

  state.selectedTypes = []
  state.selectedBundles = []
  state.selectedTags = []

  fetchPacks()
}

onClickOutside(searchInputWrapper, () => {
  state.searchAdditionalActive = false
})

const selectedAdditional = computed(() => {
  return (
    state.selectedTypes.length +
    state.selectedBundles.length +
    state.selectedTags.length
  )
})

const canClear = computed(() => {
  return state.searchQuery || selectedAdditional.value
})

function handleAdditionalClick(arr: number[], id: number) {
  if (arr.includes(id)) {
    return arr.filter(t => t !== id)
  } else {
    return [...arr, id]
  }
}

function handleTypeClick(id: number) {
  state.selectedTypes = handleAdditionalClick(state.selectedTypes, id)
}

function handleBundleClick(id: number) {
  state.selectedBundles = handleAdditionalClick(state.selectedBundles, id)
}

function handleTagClick(id: number) {
  state.selectedTags = handleAdditionalClick(state.selectedTags, id)
}

const sortSection = ref<HTMLDivElement>()

onClickOutside(sortSection, () => {
  state.sortDropdownActive = false
})
</script>

<template>
  <div class="packs-page">
    <div class="search">
      <div
        ref="searchInputWrapper"
        class="search__input-wrapper"
        :class="{ active: state.searchAdditionalActive }"
      >
        <div @click="handleMainInputClick" class="search__main-input">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M795.761 941.696 531.326 677.5q-29.761 25.264-69.6 39.415-39.84 14.15-85.161 14.15-109.835 0-185.95-76.195Q114.5 578.674 114.5 471t76.196-183.87q76.195-76.195 184.369-76.195t183.87 76.195q75.695 76.196 75.695 184.02 0 43.328-13.641 82.97-13.641 39.641-40.924 74.402L845.5 891.957l-49.739 49.739ZM375.65 662.935q79.73 0 135.29-56.245Q566.5 550.446 566.5 471t-55.595-135.69q-55.595-56.245-135.255-56.245-80.494 0-136.757 56.245Q182.63 391.554 182.63 471t56.228 135.69q56.227 56.245 136.792 56.245Z"
            />
          </svg>
          <div
            v-if="!state.searchAdditionalActive && selectedAdditional"
            class="search__main-input__additional"
          >
            +{{ selectedAdditional }}
          </div>
          <input
            v-model="state.searchQuery"
            @keydown="handleMainInputKeypress"
            ref="searchQueryInput"
            class="search__input"
            type="search"
            placeholder="Search through packs"
          />
          <button v-if="canClear" @click="handleClear" class="search__clear">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
              <path
                d="M249 854.739 201.261 807l231-231-231-231L249 297.261l231 231 231-231L758.739 345l-231 231 231 231L711 854.739l-231-231-231 231Z"
              />
            </svg>
          </button>
        </div>
        <div v-if="state.searchAdditionalActive" class="search__additional">
          <div class="search__additional__section-title">types</div>
          <div class="search__additional__section">
            <AppChip
              v-for="t in state.types"
              @click="handleTypeClick(t.id)"
              class="search__additional__chip"
              :outlined="!state.selectedTypes.includes(t.id)"
              :key="t.id"
            >
              {{ t.name }}
            </AppChip>
          </div>
          <div class="search__additional__section-title">bundles</div>
          <div class="search__additional__section">
            <AppChip
              v-for="bundle in state.bundles"
              @click="handleBundleClick(bundle.id)"
              class="search__additional__chip"
              :outlined="!state.selectedBundles.includes(bundle.id)"
              :key="bundle.id"
            >
              {{ bundle.name }}
            </AppChip>
          </div>
          <div class="search__additional__section-title">tags</div>
          <div class="search__additional__section">
            <AppChip
              v-for="tag in state.tags"
              @click="handleTagClick(tag.id)"
              class="search__additional__chip"
              :outlined="!state.selectedTags.includes(tag.id)"
              :key="tag.id"
            >
              {{ tag.name }}
            </AppChip>
          </div>
          <div class="search__additional__section">
            <AppButton @click="handleSearch" class="search__btn">
              Search
            </AppButton>
          </div>
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
    <AppError v-else-if="state.error">
      Something went wrong while fetching packs
    </AppError>
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
    <div v-else class="no-packs">
      <svg viewBox="0 0 24 24">
        <path
          d="M21.47,4.35L20.13,3.79V12.82L22.56,6.96C22.97,5.94 22.5,4.77 21.47,4.35M1.97,8.05L6.93,20C7.24,20.77 7.97,21.24 8.74,21.26C9,21.26 9.27,21.21 9.53,21.1L16.9,18.05C17.65,17.74 18.11,17 18.13,16.26C18.14,16 18.09,15.71 18,15.45L13,3.5C12.71,2.73 11.97,2.26 11.19,2.25C10.93,2.25 10.67,2.31 10.42,2.4L3.06,5.45C2.04,5.87 1.55,7.04 1.97,8.05M18.12,4.25A2,2 0 0,0 16.12,2.25H14.67L18.12,10.59"
        ></path>
      </svg>
      <h1>No packs matching your criteria</h1>
    </div>
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
  $dark-primary: darken(colors.$primary, 10%);
  $active-outline-width: 2px;

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
    align-items: center;
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

    &__additional {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      padding: 0 6px;
      font-size: 0.875rem;
      background-color: $dark-primary;
      border: $active-outline-width colors.$primary solid;
      border-radius: 4px;
    }
  }

  &__clear {
    cursor: pointer;
  }

  &__additional {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 14px;
    background-color: colors.$inp-bg;
    border-radius: 0 0 $roundness $roundness;

    &__section-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.5px;
    }

    &__section {
      display: flex;
      flex-wrap: wrap;
      gap: inherit;
    }

    &__chip {
      padding: 4px 8px;
      height: auto;
    }
  }

  &__btn {
    margin-left: auto;
  }

  &__btn {
    margin-left: auto;
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
        outline: $active-outline-width colors.$primary solid;
        outline-offset: -$active-outline-width;
        background-color: $dark-primary;
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

.no-packs {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 20px;
  margin-top: 10vh;

  svg {
    $size: 20vw;
    $max-size: 168px;

    width: $size;
    height: $size;
    max-width: $max-size;
    max-height: $max-size;
    fill: currentColor;
  }

  h1 {
    margin-top: 16px;
    font-size: clamp(1.4rem, 7vw, 2.4rem);
  }
}
</style>
