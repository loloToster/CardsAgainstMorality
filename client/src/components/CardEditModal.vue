<script setup lang="ts">
import { reactive } from "vue"

import type {
  ApiBlackCard,
  ApiWhiteCard,
  ApiCardPack,
  CardColor
} from "@backend/types"
import api from "@/utils/api"
import { notify } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import PlayingCard from "@/components/PlayingCard.vue"
import AppButton from "@/components/AppButton.vue"

const props = defineProps<{ pack: ApiCardPack }>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save-black", card: ApiBlackCard): void
  (ev: "save-white", card: ApiWhiteCard): void
}>()

const state = reactive<{
  saving: boolean
  card: {
    text: string
    color: CardColor
  }
}>({
  saving: false,
  card: {
    text: "",
    color: "black"
  }
})

async function save() {
  if (state.saving) return

  state.saving = true

  try {
    const res = await api.post(`/api/pack/${props.pack.id}/card`, state.card)

    notify({
      type: "success",
      text: "Successfully added a card"
    })

    if (state.card.color === "black") {
      emit("save-black", res.data.card)
    } else {
      emit("save-white", res.data.card)
    }
  } catch (err) {
    notify({
      type: "error",
      text: "Failed to add a card"
    })
  } finally {
    state.saving = false
  }
}
</script>
<template>
  <AppModal @close="$emit('close')" transparent>
    <div class="card-edit">
      <PlayingCard
        :color="state.card.color"
        :pack="pack.name"
        class="card-edit__card"
      >
        <textarea
          v-model="state.card.text"
          class="card-edit__text"
          placeholder="Card content..."
        ></textarea>
      </PlayingCard>
      <div class="card-edit__bottom">
        <button
          @click="state.card.color = 'black'"
          class="card-edit__color card-edit__color--black"
        ></button>
        <button
          @click="state.card.color = 'white'"
          class="card-edit__color card-edit__color--white"
        ></button>
        <AppButton
          @click="save"
          :disabled="state.saving"
          class="card-edit__save"
        >
          <div v-if="state.saving" class="card-edit__save__saving"></div>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
          >
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

    $icon-color: white;
    $icon-size: 24px;

    svg {
      width: $icon-size;
      height: $icon-size;
      fill: $icon-color;
    }

    @keyframes spin {
      from {
        transform: rotate(0);
      }

      to {
        transform: rotate(360deg);
      }
    }

    &__saving {
      height: $icon-size;
      width: $icon-size;
      border-style: solid;
      border-color: $icon-color;
      border-radius: 50%;
      border-width: 4px;
      border-top-color: transparent;
      animation: spin 1000ms infinite linear;
    }
  }
}
</style>
