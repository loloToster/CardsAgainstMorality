<script setup lang="ts">
import { computed, reactive, watch } from "vue"

import AppModal from "@/components/AppModal.vue"
import AppButton from "@/components/AppButton.vue"
import CopyButton from "@/components/CopyButton.vue"

const props = defineProps<{
  canvas: HTMLCanvasElement
}>()

defineEmits(["close"])

interface ShareData {
  files?: File[]
  text?: string
  title?: string
  url?: string
}

const state = reactive<{ blob: Blob | null; shareData: ShareData | null }>({
  blob: null,
  shareData: null
})

watch(
  () => props.canvas,
  newVal => {
    newVal.toBlob(b => {
      state.blob = b

      if (!b) return

      state.shareData = {
        text: "Some text",
        title: "Some title",
        files: [new File([b], "test.png", { type: b.type })]
      }
    })
  },
  {
    immediate: true
  }
)

const canShare = computed(() => {
  if (!state.shareData) return false
  return navigator.canShare(state.shareData)
})

function handleShare() {
  if (state.shareData) navigator.share(state.shareData)
}
</script>

<template>
  <AppModal @close="$emit('close')">
    <div class="table-picture-modal">
      <button @click="$emit('close')" class="table-picture-modal__close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
          />
        </svg>
      </button>
      <img :src="canvas.toDataURL()" />
      <div class="table-picture-modal__actions">
        <AppButton
          class="table-picture-modal__action"
          @click="handleShare"
          :disabled="!canShare"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M726.941 999q-56.441 0-96.691-40.388T590 862.055q0-7.01 1.5-17.675Q593 833.714 596 824L330 669q-18 20-43.346 32-25.346 12-52.206 12-57.27 0-97.359-40.309Q97 632.382 97 575.941t40.089-96.691Q177.178 439 234.448 439q26.86 0 51.206 10.5Q310 460 330 480l266-153q-3-8.071-4.5-18.433t-1.5-18.953q0-56.031 40.309-96.322Q670.618 153 727.059 153t96.691 40.309Q864 233.618 864 290.059t-40.089 96.691Q783.822 427 726.552 427q-27.213 0-51.959-7.969Q649.847 411.062 633 391L366 536q3 9 4 21.023 1 12.022 1 19.218t-1 15.978Q369 601 366 611l267 149q16.847-17.062 40.27-26.031Q696.692 725 726.552 725q57.27 0 97.359 40.309Q864 805.618 864 862.059t-40.309 96.691Q783.382 999 726.941 999Zm.094-655Q750 344 765.5 328.465q15.5-15.535 15.5-38.5T765.465 251.5q-15.535-15.5-38.5-15.5T688.5 251.535q-15.5 15.535-15.5 38.5t15.535 38.465q15.535 15.5 38.5 15.5Zm-493 286Q257 630 272.5 614.465q15.5-15.535 15.5-38.5T272.465 537.5q-15.535-15.5-38.5-15.5T195.5 537.535q-15.5 15.535-15.5 38.5t15.535 38.465q15.535 15.5 38.5 15.5Zm493 286Q750 916 765.5 900.465q15.5-15.535 15.5-38.5T765.465 823.5q-15.535-15.5-38.5-15.5T688.5 823.535q-15.5 15.535-15.5 38.5t15.535 38.465q15.535 15.5 38.5 15.5ZM727 290ZM234 576Zm493 286Z"
            />
          </svg>
          <div>Share</div>
        </AppButton>
        <CopyButton class="table-picture-modal__action" :content="state.blob">
          Copy Image
        </CopyButton>
      </div>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.table-picture-modal {
  position: relative;
  max-width: 96vw;
  padding: 22px;
  border-radius: 12px;
  background-color: colors.$light-surface;

  @include mixins.xs {
    background-color: transparent;
  }

  &__close {
    position: absolute;
    top: 6px;
    right: 6px;
    cursor: pointer;

    @include mixins.xs {
      top: 34px;
    }

    svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  }

  img {
    margin-bottom: 12px;
    width: 100%;
    max-height: 50vh;
    object-fit: contain;
  }

  &__actions {
    display: flex;
    justify-content: end;
    gap: 8px;
  }

  &__action {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;

    svg {
      fill: currentColor;
      height: 20px;
      width: 20px;
    }

    div {
      flex-grow: 1;
      font-size: 1rem;
    }
  }
}
</style>
