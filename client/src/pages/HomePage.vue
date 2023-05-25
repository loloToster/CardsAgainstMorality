<script setup lang="ts">
import { computed, nextTick, reactive, ref } from "vue"
import { useRouter } from "vue-router"

import { TITLE } from "@/consts"
import api from "@/utils/api"
import type { ApiCardPack } from "@backend/types"

import AppButton from "@/components/AppButton.vue"
import AppModal from "@/components/AppModal.vue"
import PlayingCard from "@/components/PlayingCard.vue"

const router = useRouter()

const state = reactive<{
  joinRoomModalActive: boolean
  joinModalCode: string
  packs: ApiCardPack[]
  numOfCommunityPacks: number | null
}>({
  joinRoomModalActive: false,
  joinModalCode: "",
  packs: [],
  numOfCommunityPacks: null
})

const joinInput = ref<HTMLInputElement>()

function handleJoin(e: MouseEvent | KeyboardEvent) {
  if (e.type === "keypress" && (e as KeyboardEvent).key !== "Enter") return

  let roomId = state.joinModalCode

  if (roomId.includes("/")) {
    roomId = roomId.split("?")[0]
    roomId =
      roomId
        .split("/")
        .filter(s => s)
        .at(-1) ?? roomId
  }

  router.push(`/room/${roomId}`)
}

api.get("/api/packs").then(res => {
  state.packs = res.data.packs
})

const NUM_OF_CIRCLE_ITEMS = 16

const circlePacks = computed(() => {
  return state.packs
    .filter(p => p.icon && p.color)
    .slice(0, NUM_OF_CIRCLE_ITEMS)
    .sort(() => Math.random() - Math.random())
})

function handleJoinOpen() {
  state.joinRoomModalActive = true
  nextTick(() => {
    joinInput.value?.focus()
  })
}
</script>

<template>
  <AppModal
    v-if="state.joinRoomModalActive"
    @close="state.joinRoomModalActive = false"
    title="Join a room"
  >
    <div class="join">
      <input
        v-model="state.joinModalCode"
        @keypress="handleJoin"
        ref="joinInput"
        placeholder="Insert Code or Link here"
        type="text"
      />
      <AppButton
        @click="handleJoin"
        :disabled="!state.joinModalCode"
        class="join__btn"
      >
        Join
      </AppButton>
    </div>
  </AppModal>
  <div class="home">
    <h1>{{ TITLE }}</h1>
    <p class="home__brief">
      The best online
      <a
        href="https://www.cardsagainsthumanity.com/"
        target="_blank"
        rel="noopener noreferrer"
        >Cards Against Humanity</a
      >
      experience
    </p>
    <div class="home__landing">
      <div class="home__landing__cards">
        <PlayingCard
          class="home__landing__card home__landing__card--black"
          :pack="TITLE"
          color="black"
        >
          I would like to ____.
        </PlayingCard>
        <RouterLink to="/room">
          <PlayingCard
            class="home__landing__card home__landing__card--create"
            :pack="TITLE"
            color="white"
          >
            Create a room.
          </PlayingCard>
        </RouterLink>
        <PlayingCard
          @click="handleJoinOpen"
          :pack="TITLE"
          color="white"
          class="home__landing__card home__landing__card--join"
        >
          Join a room.
        </PlayingCard>
      </div>
      <div class="home__stripe">
        <a
          href="http://github.com/loloToster/CardsAgainstMorality"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppButton class="home__stripe__btn">Github</AppButton>
        </a>
        <a href="#about">
          <AppButton class="home__stripe__btn">About</AppButton>
        </a>
        <AppButton class="home__stripe__btn">Lorem</AppButton>
      </div>
    </div>
    <div class="home__about" id="about">
      <!-- TODO: more detailed instruction and more about -->
      <h2>About</h2>
      <p>
        To play simply <RouterLink to="/room">Create a Room</RouterLink>, login
        anonymously or with your favourite platform, invite your friends to the
        room and have fun!
      </p>

      <h3>How to play?</h3>
      <ul>
        <li>To start the game, each player draws ten White Cards</li>
        <li>A Card Tsar is then selected and reads a random Black Card</li>
        <li>
          Everyone else fill in or answers the Black Card by submitting one
          White Card
        </li>
        <li>
          The cards are shuffled and the Tsar pick one funniest submittion, and
          whoever submitted it gets one point
        </li>
        <li>
          After the round, a new Tsar is selected and everyone draws up to ten
          White Cards
        </li>
      </ul>
      <p>
        <a class="home__about__instruction" href="">
          More detailed instruction
        </a>
      </p>
      <p>
        {{ TITLE }} is an online
        <a
          href="https://www.cardsagainsthumanity.com/"
          target="_blank"
          rel="noopener noreferrer"
          >Cards Against Humanity</a
        >
        clone. Smth smth smth....
      </p>
      <div class="home__about__scroll">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="M480 856 240 616l56-56 184 183 184-183 56 56-240 240Zm0-240L240 376l56-56 184 183 184-183 56 56-240 240Z"
          />
        </svg>
        <span> Keep scrolling to learn more </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
          <path
            d="M480 856 240 616l56-56 184 183 184-183 56 56-240 240Zm0-240L240 376l56-56 184 183 184-183 56 56-240 240Z"
          />
        </svg>
      </div>
    </div>
    <div class="home__variety">
      <div class="home__variety__text-wrapper">
        <h2>As many cards<br />as you will ever need</h2>
        <p>
          {{ TITLE }} currently<br />supports
          <span>{{ state.packs.length || "..." }} official card sets</span
          >,<br />and {{ state.numOfCommunityPacks ?? "..." }} sets created by
          the community!
        </p>
      </div>
      <div
        class="home__variety__circle"
        :class="{ active: state.packs.length }"
      >
        <div
          v-for="pack in circlePacks"
          class="home__variety__circle__el"
          :style="{ '--pack-color': pack.color ?? undefined }"
          :key="pack.id"
          v-html="pack.icon"
        ></div>
      </div>
      <div class="home__variety__under-circle"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math" as math;

@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.join {
  input {
    margin-bottom: 20px;
    width: 100%;
    font-size: 1.2rem;
    border-bottom: colors.$lightgray 2px solid;
    background-color: colors.$inp-bg;
    padding: 12px;
    border-radius: 4px 4px 0 0;
  }

  &__btn {
    width: 100%;
    @include colors.app-button(colors.$primary);
  }
}

.home {
  h1 {
    text-align: center;
    margin-top: 8vh;
    font-size: clamp(1.2rem, 10vw, 64px);
    padding: 0 12px;
  }

  h2 {
    font-size: clamp(1.3rem, 4vw, 2rem);
  }

  h3 {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
  }

  &__brief {
    text-align: center;
    font-size: clamp(1rem, 4vw, 1.5rem);
    padding: 0 10vw;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__landing {
    isolation: isolate;
    display: flex;
    flex-direction: column;
    justify-content: end;
    position: relative;
    height: 45vh;
    overflow: hidden;

    &__cards {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -20%;
      width: 870px;
      max-width: 82vw;
      height: 100%;
    }

    &__card {
      position: absolute;
      bottom: 0;
      --w: 28vh;
      transition: all 100ms ease-in-out;

      &--black {
        left: 0;

        @include mixins.sm {
          left: 50%;
          bottom: 23%;
          transform: translateX(-50%);
        }
      }

      &--create {
        right: 20%;
        transform: rotate(352deg);
        cursor: pointer;

        &:hover {
          translate: -2% -4%;
        }

        @include mixins.sm {
          right: unset;
          left: 40%;
          bottom: 0;
          transform: translateX(-50%) rotate(352deg);
        }
      }

      &--join {
        bottom: -10%;
        right: 0;
        transform: rotate(9deg);
        cursor: pointer;

        &:hover {
          translate: 2% -4%;
        }

        @include mixins.sm {
          right: unset;
          left: 60%;
          bottom: -23%;
          transform: translateX(-50%) rotate(9deg);
        }
      }
    }
  }

  @mixin section-border() {
    border-style: solid;
    border-color: colors.$darkgray;
    border-width: 1px 0;
  }

  &__stripe {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    background-color: rgba(colors.$main-bg, 0.9);
    backdrop-filter: blur(4px);
    z-index: 1;

    @include section-border();

    &__btn {
      --color: transparent;
      --h-color: transparent;
      font-size: 1rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__about {
    width: 1050px;
    max-width: 90vw;
    margin: 60px auto;
    scroll-margin-top: calc(vars.$header-height + 40px);

    p,
    ul {
      font-size: 1.175rem;
    }

    a {
      text-decoration: underline;
      color: inherit;
    }

    li:not(:last-child) {
      margin-bottom: 0.275em;
    }

    &__instruction {
      font-size: 0.875rem;
      color: colors.$primary !important;
      transform: color 200ms;

      &:hover {
        color: lighten(colors.$primary, 10%) !important;
      }
    }

    @keyframes point {
      from {
        transform: translateY(-10%);
      }

      to {
        transform: translateY(10%);
      }
    }

    &__scroll {
      display: flex;
      align-items: center;
      gap: max(12px, 3vw);
      width: fit-content;
      margin: auto;
      margin-top: 45px;
      text-align: center;
      font-size: 1.1rem;

      svg {
        fill: currentColor;
        width: 24px;
        height: 24px;

        animation: point 1s infinite alternate ease-in-out;
      }
    }
  }

  &__variety {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 70vh;
    overflow: hidden;

    $section-height: 60%;

    &__text-wrapper {
      $bg-fade: 15%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: end;
      height: $section-height;
      width: 60%;
      background: linear-gradient(
        0deg,
        rgba(colors.$main-bg, 0.85) 0%,
        colors.$main-bg $bg-fade,
        colors.$main-bg (100% - $bg-fade),
        rgba(colors.$main-bg, 0.85) 100%
      );
      backdrop-filter: blur(4px);
      text-align: end;

      @include section-border();

      @include mixins.md {
        width: 50%;
      }

      @include mixins.sm {
        align-items: center;
        background: none;
        backdrop-filter: none;
        text-align: center;
        border: none;
        width: 100%;
      }

      h2 {
        margin-bottom: 10px;
      }

      p {
        margin: 0;
        font-size: clamp(1rem, 2.6vw, 1.3rem);

        span {
          font-weight: bold;
          font-size: 1.1em;
        }
      }
    }

    @keyframes carousel {
      from {
        transform: rotate(0);
      }

      to {
        transform: rotate(360deg);
      }
    }

    &__circle {
      $carousel-duration: 30s;

      z-index: -1;
      position: relative;
      width: 0;
      height: 0;

      @include mixins.sm {
        position: absolute;
        left: 50%;
        top: 50%;
      }

      &.active {
        animation: carousel $carousel-duration linear infinite;
      }

      $radius: clamp(165px, 40vw, 30vh);
      $num-of-els: 16;

      &__el {
        $size: min(7vw, 50px);

        position: absolute;
        width: $size;
        height: $size;

        :deep(svg) {
          height: 100%;
          width: 100%;

          *[fill="black"] {
            fill: var(--pack-color);
          }

          *[fill="white"] {
            fill: colors.$main-bg;
          }
        }

        @mixin pos($deg, $rotation: 0deg) {
          transform: translate(
              calc(-50% + (cos($deg) * $radius)),
              calc(-50% + (sin($deg) * $radius))
            )
            rotate($rotation);
        }

        @for $i from 1 through $num-of-els {
          $deg: ($i - 1) * math.div(360deg, $num-of-els);

          @keyframes carousel-child-#{$i} {
            from {
              @include pos($deg);
            }

            to {
              @include pos($deg, -360deg);
            }
          }

          &:nth-child(#{$i}) {
            @include pos($deg);
            animation: carousel-child-#{$i} $carousel-duration linear infinite;
          }
        }
      }
    }

    &__under-circle {
      z-index: -2;
      height: $section-height;
      flex-grow: 1;

      @include section-border();

      @include mixins.sm {
        border: none;
      }
    }
  }
}
</style>
