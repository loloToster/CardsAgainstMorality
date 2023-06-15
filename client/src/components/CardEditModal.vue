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

export type EditableCard =
  | (ApiBlackCard & { color: "black" })
  | (ApiWhiteCard & { color: "white" })

const props = defineProps<{
  pack: ApiCardPack
  card?: EditableCard | null
}>()

const emit = defineEmits<{
  (ev: "close"): void
  (ev: "save-black", card: ApiBlackCard): void
  (ev: "save-white", card: ApiWhiteCard): void
  (ev: "delete", cardId: number, color: CardColor): void
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
    text: props.card?.text ?? "",
    color: props.card?.color ?? "black"
  }
})

async function createCard() {
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
  }
}

async function modifyCard() {
  if (!props.card) return

  try {
    await api.patch(`/api/card/${props.card.color}/${props.card.id}`, {
      text: state.card.text
    })

    notify({
      type: "success",
      text: "Successfully modified a card"
    })

    if (props.card.color === "black") {
      emit("save-black", { ...props.card, ...state.card })
    } else {
      emit("save-white", { ...props.card, ...state.card })
    }
  } catch (err) {
    notify({
      type: "error",
      text: "Failed to modify a card"
    })
  }
}

async function save() {
  if (state.saving) return

  try {
    state.saving = true

    if (props.card) {
      await modifyCard()
    } else {
      await createCard()
    }
  } finally {
    state.saving = false
  }
}

async function handleDelete() {
  if (state.saving) return

  state.saving = true

  try {
    await api.delete(`/api/card/${state.card.color}/${props.card?.id}`)

    if (!props.card) {
      // this should never happen
      throw new Error("No card to delete?")
    }

    notify({
      type: "success",
      text: "Successfully deleted a card"
    })

    emit("delete", props.card.id, props.card.color)
  } catch (err) {
    notify({
      type: "error",
      text: "Failed to delete a card"
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
      <div class="card-edit__menu">
        <button v-wave>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="M275-200v-560h228q66 0 114.5 42T666-612q0 38-21 70t-56 49v6q43 14 69.5 50t26.5 81q0 68-52.5 112T510-200H275Zm86-76h144q38 0 66-25t28-63q0-37-28-62t-66-25H361v175Zm0-247h136q35 0 60.5-23t25.5-58q0-35-25.5-58.5T497-686H361v163Z"
            />
          </svg>
        </button>
        <button v-wave>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path
              d="M224-199v-80h134l139-409H338v-80h380v80H584L445-279h159v80H224Z"
            />
          </svg>
        </button>
        <button v-if="props.card" @click="handleDelete" v-wave>
          <svg
            class="red"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
          >
            <path
              d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z"
            />
          </svg>
        </button>
      </div>
      <div class="card-edit__bottom">
        <button
          v-if="!props.card"
          @click="state.card.color = 'black'"
          class="card-edit__color card-edit__color--black"
        ></button>
        <button
          v-if="!props.card"
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
  position: relative;

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

  &__menu {
    position: absolute;
    top: 0;
    left: 100%;
    padding: 4px;

    button {
      padding: 4px;
      border-radius: 50%;
    }

    svg {
      width: 28px;
      height: 28px;
      fill: colors.$lightgray;

      &.red {
        fill: colors.$danger;
      }
    }
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
