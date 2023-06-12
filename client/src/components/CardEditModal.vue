<script setup lang="ts">
import { reactive } from "vue"

import { ApiCardPack } from "@backend/types"

import AppModal from "@/components/AppModal.vue"
import PlayingCard from "@/components/PlayingCard.vue"
import AppButton from "@/components/AppButton.vue"

export interface CardDetails {
  text: string
  color: "white" | "black"
}

defineProps<{ pack: ApiCardPack }>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save", card: CardDetails): void
}>()

const state = reactive<CardDetails>({
  text: "",
  color: "black"
})

async function save() {
  emit("save", state)
}
</script>
<template>
  <AppModal @close="$emit('close')" transparent>
    <div class="card-edit">
      <PlayingCard
        :color="state.color"
        :pack="pack.name"
        class="card-edit__card"
      >
        <textarea
          v-model="state.text"
          class="card-edit__text"
          placeholder="Card content..."
        ></textarea>
      </PlayingCard>
      <div class="card-edit__bottom">
        <button
          @click="state.color = 'black'"
          class="card-edit__color card-edit__color--black"
        ></button>
        <button
          @click="state.color = 'white'"
          class="card-edit__color card-edit__color--white"
        ></button>
        <AppButton @click="save" class="card-edit__save">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M378-222 130-470l68-68 180 180 383-383 68 68-451 451Z" />
          </svg>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;

.card-edit {
  &__card {
    --w: min(280px, 80vw);
  }

  &__text {
    width: 100%;
    height: 100%;
    resize: none;
    color: inherit;
    font-weight: inherit;
    font-size: inherit;
  }

  &__bottom {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  &__color {
    height: 36px;
    width: 36px;
    border: 1px solid colors.$inp;
    border-radius: 50%;
    cursor: pointer;

    &--black {
      background-color: black;
    }

    &--white {
      background-color: white;
    }
  }

  &__save {
    margin-left: auto;
    @include colors.app-button(colors.$primary);

    svg {
      fill: white;
      width: 24px;
      height: 24px;
    }
  }
}
</style>
