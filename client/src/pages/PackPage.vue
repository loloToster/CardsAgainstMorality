<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useHead } from "@unhead/vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import { useScroll } from "@vueuse/core"
import Color from "color"

import api from "@/utils/api"

import type {
  ApiCardPack,
  ApiCardPackRichEditableDetails,
  ApiBlackCard,
  ApiWhiteCard,
  CardColor
} from "@backend/types"

import { PackPrivacy } from "@backend/consts"

import { useUserStore } from "@/contexts/user"
import { useNotificationsStore } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import PackDetailsModal from "@/components/PackDetailsModal.vue"
import CardEditModal, { EditableCard } from "@/components/CardEditModal.vue"
import AppLoading from "@/components/AppLoading.vue"
import AppError from "@/components/AppError.vue"
import AppButton from "@/components/AppButton.vue"
import AppChip from "@/components/AppChip.vue"
import PackIcon from "@/components/PackIcon.vue"
import PlayingCard from "@/components/PlayingCard.vue"
import CardPack from "@/components/CardPack.vue"
import LikeButton from "@/components/LikeButton.vue"

import BlackCardIcon from "@/assets/black-card-icon.svg?component"
import WhiteCardIcon from "@/assets/white-card-icon.svg?component"

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const notifications = useNotificationsStore()

const state = reactive<{
  pack: ApiCardPack | null
  loading: boolean
  packError: boolean
  fetchedBlackCards: ApiBlackCard[]
  fetchedWhiteCards: ApiWhiteCard[]
  cardsError: boolean
  showMiniTop: boolean
  editDetailsOpen: boolean
  editCardOpen: boolean
  lastCardColor: CardColor
  editedCard: EditableCard | null
  deleteModalOpen: boolean
  deleting: boolean
}>({
  pack: null,
  loading: true,
  packError: false,
  fetchedBlackCards: [],
  fetchedWhiteCards: [],
  cardsError: false,
  showMiniTop: false,
  editDetailsOpen: false,
  editCardOpen: false,
  lastCardColor: "black",
  editedCard: null,
  deleteModalOpen: false,
  deleting: false
})

useHead({ title: () => state.pack?.name || "Card Pack" })

// TODO: add pagination
async function fetchCards(id: number) {
  try {
    const res = await api.get(`/api/pack/${id}/cards`)
    state.fetchedBlackCards = res.data.cards.blackCards
    state.fetchedWhiteCards = res.data.cards.whiteCards
  } catch (err) {
    console.error(err)
    state.cardsError = true
  }
}

api
  .get("/api/pack/" + encodeURIComponent(route.params.id.toString()))
  .then(res => {
    state.pack = res.data.pack
    fetchCards(res.data.pack.id)
  })
  .catch(err => {
    console.error(err)
    state.packError = true
  })
  .finally(() => {
    state.loading = false
  })

interface BgIconPos {
  top: number
  left: number
  rotate: number
  mobile?: Omit<BgIconPos, "mobile" | "rotate">
}

const BG_ICONS: BgIconPos[] = [
  {
    top: 17,
    left: 57,
    rotate: -8,
    mobile: {
      top: 14,
      left: 8
    }
  },
  {
    top: 72,
    left: 5,
    rotate: -4,
    mobile: {
      top: 13,
      left: 90
    }
  },
  {
    top: 26,
    left: 75,
    rotate: 5,
    mobile: {
      top: 44,
      left: 16
    }
  },
  {
    top: 79,
    left: 83,
    rotate: 8
  },
  {
    top: 15,
    left: 94,
    rotate: -12,
    mobile: {
      top: 49,
      left: 82
    }
  },
  {
    top: 10,
    left: 10,
    rotate: 10,
    mobile: {
      top: 26,
      left: 73
    }
  }
]

const top = ref<HTMLElement>()

useScroll(window, {
  onScroll() {
    if (!top.value) return
    const { y, height } = top.value.getBoundingClientRect()
    state.showMiniTop = y + height < 0
  }
})

const light = computed(() => {
  return state.pack?.color ? Color(state.pack.color).isLight() : true
})

const numOfBlackDummies = computed(() => {
  if (!state.pack) return 0
  return Math.max(state.pack.numOfBlacks - state.fetchedBlackCards.length, 0)
})

const numOfWhiteDummies = computed(() => {
  if (!state.pack) return 0
  return Math.max(state.pack.numOfWhites - state.fetchedWhiteCards.length, 0)
})

async function handleLike(liked: boolean) {
  if (!state.pack) return

  const url = `/api/pack/${state.pack.id}/like`

  try {
    await (liked ? api.put : api.delete)(url)
  } catch {
    notifications.add({
      type: "error",
      text: `Failed to ${liked ? "like" : "dislike"}`
    })
  }
}

const owns = computed(() => {
  return user.value && state.pack?.owner?.id === user.value.id
})

function handleDetailsSave(details: ApiCardPackRichEditableDetails) {
  state.editDetailsOpen = false

  if (!state.pack) return

  state.pack.name = details.name
  state.pack.privacy = details.privacy
  state.pack.type = details.type
  state.pack.tags = details.tags
  state.pack.color = details.color
  state.pack.icon = details.icon
}

function handleCreateCard() {
  state.editedCard = null
  state.editCardOpen = true
}

function handleBlackCardSave(card: ApiBlackCard) {
  state.editCardOpen = false
  state.lastCardColor = "black"

  if (!state.pack) return

  const modified = state.fetchedBlackCards.findIndex(c => c.id === card.id)

  if (modified < 0) {
    state.pack.numOfBlacks++
    state.fetchedBlackCards.push(card)
  } else {
    state.fetchedBlackCards[modified] = card
  }
}

function handleWhiteCardSave(card: ApiWhiteCard) {
  state.editCardOpen = false
  state.lastCardColor = "white"

  if (!state.pack) return

  const modified = state.fetchedWhiteCards.findIndex(c => c.id === card.id)

  if (modified < 0) {
    state.pack.numOfWhites++
    state.fetchedWhiteCards.push(card)
  } else {
    state.fetchedWhiteCards[modified] = card
  }
}

function handleCardDelete(cardId: number, color: CardColor) {
  state.editCardOpen = false

  if (!state.pack) return

  if (color === "black") {
    state.pack.numOfBlacks--
    state.fetchedBlackCards = state.fetchedBlackCards.filter(
      c => c.id !== cardId
    )
  } else {
    state.pack.numOfWhites--
    state.fetchedWhiteCards = state.fetchedWhiteCards.filter(
      c => c.id !== cardId
    )
  }
}

function handleEdit(card: EditableCard) {
  state.editedCard = card
  state.editCardOpen = true
}

function editBlackCard(card: ApiBlackCard) {
  if (!owns.value) return
  handleEdit({ ...card, color: "black" })
}

function editWhiteCard(card: ApiWhiteCard) {
  if (!owns.value) return
  handleEdit({ ...card, color: "white" })
}

async function handleDelete() {
  if (state.deleting) return

  state.deleting = true

  try {
    await api.delete(`/api/pack/${state.pack?.id}`)

    notifications.add({
      type: "success",
      text: "Successfully deleted the pack"
    })

    router.push("/my-packs")
  } catch (err) {
    console.error(err)

    notifications.add({
      type: "error",
      text: "Failed to delete the pack"
    })

    state.deleting = false
  }
}
</script>

<template>
  <AppModal v-if="state.deleteModalOpen" @close="state.deleteModalOpen = false">
    <div class="delete-modal">
      <h1>
        Are you sure you want
        <br />
        to delete this pack?
      </h1>
      <div>
        <AppButton @click="state.deleteModalOpen = false">No</AppButton>
        <AppButton @click="handleDelete">
          {{ state.deleting ? "..." : "Yes" }}
        </AppButton>
      </div>
    </div>
  </AppModal>
  <PackDetailsModal
    v-if="state.editDetailsOpen && state.pack"
    @save="handleDetailsSave"
    @close="state.editDetailsOpen = false"
    :pack="state.pack"
  />
  <CardEditModal
    v-if="state.editCardOpen && state.pack"
    @save-black="handleBlackCardSave"
    @save-white="handleWhiteCardSave"
    @delete="handleCardDelete"
    @close="state.editCardOpen = false"
    :color="state.lastCardColor"
    :card="state.editedCard"
    :pack="state.pack"
  />
  <AppLoading v-if="state.loading">Loading the Pack</AppLoading>
  <AppError v-else-if="state.packError">
    Something went wrong while fetching the pack
  </AppError>
  <div
    v-else-if="state.pack"
    class="pack"
    :class="{ 'pack--light': light }"
    :style="{
      '--pack-color': state.pack.color ?? undefined
    }"
  >
    <div class="pack__mini-top" :class="{ active: state.showMiniTop }">
      <div class="pack__mini-top__content">
        <PackIcon :icon="state.pack.icon" class="pack__mini-top__icon" />
        <div class="pack__mini-top__name">{{ state.pack.name }}</div>
      </div>
    </div>
    <div class="pack__top" ref="top">
      <div class="pack__top__icons">
        <PackIcon
          v-for="icon in BG_ICONS"
          :icon="state.pack.icon"
          class="pack__top__icon"
          :class="{ 'pack__top__icon--mobile': icon.mobile }"
          :style="{
            '--top': icon.top,
            '--left': icon.left,
            '--rotate': icon.rotate,
            '--mobile-top': icon.mobile?.top,
            '--mobile-left': icon.mobile?.left
          }"
          :key="icon.left"
        />
      </div>
      <div class="pack__top__content">
        <CardPack class="pack__image" :icon="state.pack.icon ?? undefined">
          {{ state.pack.name }}
        </CardPack>
        <div class="pack__meta">
          <RouterLink
            :to="`/packs?types=${state.pack.type.id}`"
            class="pack__meta__type"
          >
            {{ state.pack.type.name }}
          </RouterLink>
          <h1
            class="pack__meta__name"
            :style="{ '--length': state.pack.name.length }"
          >
            {{ state.pack.name }}
          </h1>
          <div class="pack__meta__tags">
            <AppChip
              v-if="state.pack.privacy !== PackPrivacy.Public"
              class="pack__meta__tag pack__meta__tag--private"
              v-tooltip="'Only you can view this pack'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                  d="M816-64 648-229q-35 14-79 21.5t-89 7.5q-146 0-265-81.5T40-500q20-52 55.5-101.5T182-696L56-822l42-43 757 757-39 44ZM480-330q14 0 30-2.5t27-7.5L320-557q-5 12-7.5 27t-2.5 30q0 72 50 121t120 49Zm278 40L629-419q10-16 15.5-37.5T650-500q0-71-49.5-120.5T480-670q-22 0-43 5t-38 16L289-760q35-16 89.5-28T485-800q143 0 261.5 81.5T920-500q-26 64-67 117t-95 93ZM585-463 443-605q29-11 60-4.5t54 28.5q23 23 32 51.5t-4 66.5Z"
                />
              </svg>
              <span>Private</span>
            </AppChip>
            <RouterLink
              v-if="state.pack.bundle"
              :to="`/packs?bundles=${state.pack.bundle.id}`"
            >
              <AppChip class="pack__meta__tag pack__meta__tag--bundle">
                {{ state.pack.bundle.name }}
              </AppChip>
            </RouterLink>
            <RouterLink
              v-for="tag in state.pack.tags"
              :to="`/packs?tags=${tag.id}`"
              :key="tag.id"
            >
              <AppChip class="pack__meta__tag" outlined>
                {{ tag.name }}
              </AppChip>
            </RouterLink>
          </div>
          <div class="pack__meta__row">
            <div v-if="state.pack.official" class="pack__meta__owner">
              Cards Against Humanity
            </div>
            <RouterLink
              v-else-if="state.pack.owner"
              :to="`/packs?owner=${state.pack.owner.id}`"
              class="pack__meta__owner pack__meta__owner--custom"
            >
              {{ state.pack.owner.displayName }}
            </RouterLink>
            <div v-if="state.pack.likedBy" class="pack__meta__likes">
              {{ state.pack.likedBy }} likes
            </div>
            <div v-if="state.pack.numOfBlacks" class="pack__meta__black">
              {{ state.pack.numOfBlacks }} black cards
            </div>
            <div v-if="state.pack.numOfWhites" class="pack__meta__white">
              {{ state.pack.numOfWhites }} white cards
            </div>
          </div>
          <div class="pack__meta__actions">
            <LikeButton
              @change="handleLike"
              :liked="state.pack.liked ?? false"
              class="pack__meta__action"
            />
            <button
              v-if="owns"
              @click="state.editDetailsOpen = true"
              class="pack__meta__action"
              v-tooltip="'Edit details'"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                ></path>
              </svg>
            </button>
            <button
              v-if="owns"
              @click="handleCreateCard"
              class="pack__meta__action"
              v-tooltip="'Add card'"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M13.09 20H5V6H3V20A2 2 0 0 0 5 22H13.81A5.5 5.5 0 0 1 13.09 20M19 7V2H9A2 2 0 0 0 7 4V16A2 2 0 0 0 9 18H13.09A6 6 0 0 1 21 13.34V4A2 2 0 0 0 19 2M20 15V18H23V20H20V23H18V20H15V18H18V15Z"
                ></path>
              </svg>
            </button>
            <button
              v-if="owns"
              @click="state.deleteModalOpen = true"
              class="pack__meta__action red"
              v-tooltip="'Delete the pack'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                  d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <AppError v-if="state.cardsError" class="pack__cards-error">
      Something went wrong while fetching cards
    </AppError>
    <div v-else class="pack__cards-wrapper">
      <div id="black-cards" class="pack__cards pack__cards--black">
        <div
          class="pack__cards__dummy"
          v-for="i in numOfBlackDummies"
          :key="i"
        ></div>
        <PlayingCard
          v-for="card in state.fetchedBlackCards"
          @click="editBlackCard(card)"
          class="pack__cards__card"
          color="black"
          :text="card.text"
          :pack="state.pack.name"
          :pick="card.pick"
          :draw="card.draw"
          :key="card.id"
        />
      </div>
      <div id="white-cards" class="pack__cards pack__cards--white">
        <div
          class="pack__cards__dummy"
          v-for="i in numOfWhiteDummies"
          :key="i"
        ></div>
        <PlayingCard
          v-for="card in state.fetchedWhiteCards"
          @click="editWhiteCard(card)"
          class="pack__cards__card"
          :text="card.text"
          :pack="state.pack.name"
          :key="card.id"
        />
      </div>
      <div class="pack__goto-wrapper">
        <a
          class="pack__goto pack__goto--black"
          href="#black-cards"
          title="Scroll to Black Cards"
        >
          <WhiteCardIcon />
        </a>
        <a
          class="pack__goto pack__goto--white"
          href="#white-cards"
          title="Scroll to White Cards"
        >
          <BlackCardIcon />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as vars;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.delete-modal {
  h1 {
    font-size: 1.4rem;
  }

  div {
    display: flex;
    justify-content: end;
    gap: 8px;
    margin-top: 12px;
  }
}

.pack {
  --pack-color: white;
  --r: 255;
  --g: 255;
  --b: 255;

  --bg-icon-color: white;
  --meta-content-color: white;

  &--light {
    --bg-icon-color: black;
    --meta-content-color: #{colors.$pack-color};
  }

  $mini-top-height: 30px;

  &__mini-top {
    position: fixed;
    top: vars.$header-height;
    left: 0;
    z-index: 1;
    height: 0;
    width: 100%;
    overflow: hidden;
    background-color: var(--pack-color);
    transition: height 50ms ease-out;

    &.active {
      height: $mini-top-height;
      transition: height 200ms ease-out;
    }

    &__content {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 90%;
      max-width: 1100px;
      height: 100%;
      margin: auto;
    }

    &__icon {
      height: 20px;
      width: 20px;

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--pack-color);
        }

        *[fill="black"] {
          fill: var(--meta-content-color);
        }
      }
    }

    &__name {
      color: var(--meta-content-color);
      font-weight: bold;
      font-size: 0.875rem;
    }
  }

  &__top {
    position: relative;
    width: 100%;
    background-color: var(--pack-color);

    @include mixins.sm {
      margin-bottom: 64px;
    }

    &__icon {
      position: absolute;
      top: calc(var(--top) * 1%);
      left: calc(var(--left) * 1%);
      width: 20px;
      height: 20px;
      transform: rotate(calc(var(--rotate) * 1deg));

      @include mixins.sm {
        display: none;

        &--mobile {
          display: block;
          top: calc(var(--mobile-top) * 1%);
          left: calc(var(--mobile-left) * 1%);
        }
      }

      :deep(svg) {
        width: 100%;
        height: 100%;

        *[fill="white"] {
          fill: var(--pack-color);
        }

        *[fill="black"] {
          fill: var(--bg-icon-color);
        }
      }
    }

    &__content {
      display: flex;
      align-items: end;
      gap: 65px;
      width: 90%;
      max-width: 1100px;
      height: 100%;
      margin: auto;

      @include mixins.sm {
        align-items: center;
        flex-direction: column;
        gap: 24px;
        padding-top: 24px;
      }
    }
  }

  &__image {
    height: 35vh;
    transform: translate(0, 20%);
    rotate: -3deg;
    font-size: 2rem;

    @include mixins.sm {
      height: 20vh;
      transform: translate(0, 0);
      rotate: -3deg;
      font-size: 1.2rem;
    }

    @keyframes wiggle {
      0%,
      100% {
        rotate: -3deg;
      }

      30% {
        rotate: -6deg;
      }

      70% {
        rotate: 0deg;
      }
    }

    &:hover {
      animation: wiggle 400ms linear;
    }
  }

  &__meta {
    position: relative;
    color: var(--meta-content-color);
    flex-grow: 1;
    padding-bottom: 24px;

    &__type {
      width: fit-content;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      color: inherit;
      cursor: pointer;

      &:hover {
        text-decoration: underline 2px;
      }
    }

    &__name {
      // on what length the text should shrink
      --text-boundry: 11;
      // text size reference
      --text-base: 6.5vw;

      margin-top: max(0.08em, 6px);
      margin-bottom: max(0.12em, 10px);
      font-size: clamp(
        1.8rem,
        (var(--text-boundry) / var(--length)) * var(--text-base),
        6rem
      );

      @include mixins.sm {
        --text-boundry: 13;
        --text-base: 11vw;
      }
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;

      a {
        text-decoration: none;
      }
    }

    &__tag {
      --chip-bg: var(--meta-content-color);

      padding: 0 8px;
      height: 26px;

      &--private,
      &--bundle {
        color: var(--pack-color);

        svg {
          width: 16px;
          height: 16px;
          fill: var(--pack-color);
        }
      }

      &--private {
        cursor: default;
      }
    }

    &__owner {
      font-weight: 700;
      text-decoration: none;
      color: inherit;

      &--custom:hover {
        text-decoration: underline;
      }
    }

    &__row {
      display: flex;
      flex-wrap: wrap;
      font-size: 0.875rem;

      & > * {
        &::before {
          content: "•";
          margin: 0 4px;
        }

        &:first-child::before {
          content: "";
          margin: 0;
        }
      }
    }

    &__actions {
      display: flex;
      gap: 18px;
      position: absolute;
      bottom: 0;
      left: 0;
      transform: translateY(100%);
      width: 100%;
      padding-top: 16px;
    }

    &__action {
      width: 32px;
      height: 32px;

      svg {
        width: 100%;
        height: 100%;
        fill: colors.$lightgray;
        transition: fill 100ms;
      }

      &:hover svg {
        fill: colors.$subtext;
      }

      &.red svg {
        fill: colors.$danger;
      }

      &.red:hover svg {
        fill: lighten(colors.$danger, 15%);
      }
    }
  }

  &__cards-error {
    margin-top: 120px;
  }

  $cards-gap: 12px;

  &__cards {
    $gap: 12px;

    --width: 65vw;
    --items-in-row: 5;

    @include mixins.lg {
      --items-in-row: 4;
    }

    @include mixins.md {
      --items-in-row: 3;
    }

    @include mixins.xs {
      --width: 90vw;
      --items-in-row: 2;
    }

    display: flex;
    flex-wrap: wrap;
    gap: $gap;
    width: var(--width);
    margin: auto;
    scroll-margin-top: calc(
      vars.$header-height + $mini-top-height + $cards-gap
    );

    --size-of-item: calc(
      (var(--width) / var(--items-in-row)) -
        (#{$gap} * (var(--items-in-row) - 1) / var(--items-in-row))
    );

    $big-card-gap: $cards-gap * 4;

    &--black {
      margin-top: 130px;
      margin-bottom: $big-card-gap;

      @include mixins.sm {
        margin-top: $big-card-gap;
      }
    }

    &--white {
      margin-bottom: $big-card-gap;
    }

    &__card {
      --w: var(--size-of-item);
    }

    &__dummy {
      width: var(--size-of-item);
      aspect-ratio: vars.$card-aspect-ratio;
      background-color: colors.$light-surface;
      // todo: move dummies to Card Component
      border-radius: calc(var(--size-of-item) * 0.049);
    }
  }

  &__goto-wrapper {
    position: fixed;
    right: 30px;
    bottom: 30px;
    display: flex;
    gap: 8px;
  }

  &__goto {
    $size: clamp(48px, 5vw, 64px);

    display: flex;
    align-items: center;
    justify-content: center;
    width: $size;
    height: $size;
    border-radius: 50%;
    transition: scale 100ms;
    outline: solid 2px colors.$main-bg;

    &:hover {
      scale: 1.1;
    }

    &:active {
      scale: 0.95;
    }

    &--black {
      background-color: black;
    }

    &--white {
      background-color: white;
    }

    svg {
      width: 50%;
      height: 50%;
    }
  }
}
</style>
