<script setup lang="ts">
import { reactive } from "vue"
import { RouterLink } from "vue-router"
import { ApiCardPack } from "@backend/types"
import AppLoading from "@/components/AppLoading.vue"
import CardPack from "@/components/CardPack.vue"

const state = reactive<{ packs: ApiCardPack[] }>({ packs: [] })

fetch("/api/packs").then(async res => {
  if (res.ok) {
    const { packs } = await res.json()
    state.packs = packs
  }
})
</script>

<template>
  <AppLoading v-if="!state.packs.length">Loading packs</AppLoading>
  <div v-else class="packs">
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
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

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
    transition: scale 100ms;

    &:hover {
      scale: 1.05;
    }
  }
}
</style>
