<script setup lang="ts">
import { reactive } from "vue"

import { CardPack } from "../types/game"
import { moveItem } from "../utils"
import SimpleChip from "./SimpleChip.vue"

const emit = defineEmits<{
  (e: "start", packsIds: number[]): void
}>()

const state = reactive<{
  unselectedPacks: CardPack[]
  selectedPacks: CardPack[]
}>({
  unselectedPacks: [],
  selectedPacks: []
})

function selectPack(packId: number) {
  moveItem(state.unselectedPacks, state.selectedPacks, p => p.id === packId)
}

function unselectPack(packId: number) {
  moveItem(state.selectedPacks, state.unselectedPacks, p => p.id === packId)
}

fetch("/api/packs").then(async res => {
  const { packs } = await res.json()
  state.unselectedPacks = packs
})

function onStart() {
  emit(
    "start",
    state.selectedPacks.map(p => p.id)
  )
}
</script>
<template>
  <div class="settings">
    <div class="settings__left">
      <div class="settings__panel">
        <h3>Select packs that you want to use:</h3>
        <div class="settings__packs">
          <SimpleChip
            @click="selectPack(pack.id)"
            v-for="pack in state.unselectedPacks"
            :key="pack.id"
          >
            {{ pack.name }}
          </SimpleChip>
        </div>
        <h3>Selected packs:</h3>
        <div class="settings__packs">
          <SimpleChip
            @click="unselectPack(pack.id)"
            v-for="pack in state.selectedPacks"
            :key="pack.id"
          >
            {{ pack.name }}
          </SimpleChip>
        </div>
        <button @click="onStart()">Start</button>
      </div>
    </div>
    <div class="settings__right">
      <div class="settings__invite">
        <div class="settings__panel"></div>
      </div>
      <div class="settings__players">
        <div class="settings__panel"></div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
$main-gap: 16px;
.settings {
  display: flex;
  gap: $main-gap;
  width: 90vw;
  max-width: 1100px;
  height: 80vh;
  margin: auto;

  h3 {
    margin-top: 0;
    padding-top: 10px;
  }

  &__left {
    height: 100%;
    flex-grow: 1;
  }

  &__right {
    display: flex;
    flex-direction: column;
    gap: $main-gap;
    width: 20vw;
    max-width: 300px;
    min-width: 250px;
  }

  &__panel {
    background-color: #3a3a3a;
    width: 100%;
    height: 100%;
    border-radius: $main-gap;
  }

  &__invite {
    height: 23vh;
    min-height: 200px;
    max-height: 300px;
  }

  &__players {
    flex-grow: 1;
  }

  &__packs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
