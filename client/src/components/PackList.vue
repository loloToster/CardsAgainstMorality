<script setup lang="ts">
import type { ApiCardPack } from "@backend/types"
import CardPack from "@/components/CardPack.vue"

defineProps<{ packs: ApiCardPack[] }>()
</script>

<template>
  <div class="packs">
    <RouterLink
      v-for="pack in packs"
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
@use "@/styles/colors" as colors;
@use "@/styles/mixins" as mixins;

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
