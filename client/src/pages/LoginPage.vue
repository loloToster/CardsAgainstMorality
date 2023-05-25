<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from "vue"
import { RouterLink, useRoute } from "vue-router"
import HCaptcha from "@hcaptcha/vue3-hcaptcha"

import { TITLE } from "@/consts"
import { getRandomInt } from "@/utils"
import api from "@/utils/api"
import type { ApiRandomCard } from "@backend/types"

import AppButton from "@/components/AppButton.vue"
import PlayingCard from "@/components/PlayingCard.vue"

import CaptchaImg from "@/assets/captcha.png"

const CAPTCHA_SITEKEY = import.meta.env.VITE_CAPTCHA_SITEKEY

const route = useRoute()

function loginWith(strategy: string, query: Record<string, string> = {}) {
  const returnTo = route.query.returnTo
  if (returnTo) query.returnTo = returnTo.toString()

  let queryString = Object.keys(query)
    .map(k => `${k}=${encodeURIComponent(query[k])}`)
    .join("&")

  queryString = queryString ? `?${queryString}` : ""

  window.location.replace(`/auth/${strategy}${queryString}`)
}

function onVerify(token: string) {
  loginWith("anonymous", { token })
}

function onLoginAnonymously() {
  if (CAPTCHA_SITEKEY) {
    state.captchaOpen = true
  } else {
    loginWith("anonymous")
  }
}

interface AnimatedCard extends ApiRandomCard {
  size: number
  pos: number
  delay: number
  fallSpeed: number
  rotateSpeed: number
  rotateDirection: boolean
}

const state = reactive<{ fallingCards: AnimatedCard[]; captchaOpen: boolean }>({
  fallingCards: [],
  captchaOpen: false
})

function addCards(newCards: ApiRandomCard[]) {
  const animatedCards: AnimatedCard[] = newCards.map(c => ({
    ...c,
    size: getRandomInt(80, 160),
    pos: getRandomInt(0, 90),
    delay: getRandomInt(0, 10000),
    fallSpeed: getRandomInt(8000, 13000),
    rotateSpeed: getRandomInt(7000, 10000),
    rotateDirection: Math.random() < 0.5
  }))

  animatedCards.forEach(c => state.fallingCards.push(c))
}

async function fetchNewCards() {
  const res = await api.get("/api/packs/random-cards")
  addCards(res.data.cards)
}

let newCardsInterval: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  fetchNewCards()
  newCardsInterval = setInterval(fetchNewCards, 8000)
})

onUnmounted(() => {
  clearInterval(newCardsInterval)
})

function onFallen(card: ApiRandomCard) {
  state.fallingCards = state.fallingCards.filter(c => c !== card)
}
</script>

<template>
  <div class="login">
    <div
      v-for="card in state.fallingCards"
      @animationend="onFallen(card)"
      class="login__card"
      :class="{ 'login__card--spin-left': card.rotateDirection }"
      :style="{
        '--pos': card.pos,
        '--delay': card.delay,
        '--fall-speed': card.fallSpeed,
        '--rotate-speed': card.rotateSpeed
      }"
      :key="card.id"
    >
      <PlayingCard
        :color="card.color"
        :text="card.text"
        :pack="card.pack"
        :width="card.size"
      />
    </div>
    <div class="login__container">
      <div v-if="state.captchaOpen" class="login__captcha">
        <img :src="CaptchaImg" />
        <h1>Create an anonymous account</h1>
        <HCaptcha
          class="login__captcha__btn"
          :sitekey="CAPTCHA_SITEKEY"
          theme="dark"
          @verify="onVerify"
        />
      </div>
      <div v-else class="login__main">
        <RouterLink to="/" class="login__logo">
          {{ TITLE }}
        </RouterLink>
        <AppButton
          @click="onLoginAnonymously"
          color="#080808"
          hColor="black"
          class="login__btn login__btn--anonymous login__anonymous-btn"
        >
          <svg viewBox="0 0 24 24">
            <path
              d="M17.06 13C15.2 13 13.64 14.33 13.24 16.1C12.29 15.69 11.42 15.8 10.76 16.09C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17C3 19.21 4.77 21 6.94 21C9 21 10.68 19.38 10.84 17.32C11.18 17.08 12.07 16.63 13.16 17.34C13.34 19.39 15 21 17.06 21C19.23 21 21 19.21 21 17C21 14.79 19.23 13 17.06 13M6.94 19.86C5.38 19.86 4.13 18.58 4.13 17S5.39 14.14 6.94 14.14C8.5 14.14 9.75 15.42 9.75 17S8.5 19.86 6.94 19.86M17.06 19.86C15.5 19.86 14.25 18.58 14.25 17S15.5 14.14 17.06 14.14C18.62 14.14 19.88 15.42 19.88 17S18.61 19.86 17.06 19.86M22 10.5H2V12H22V10.5M15.53 2.63C15.31 2.14 14.75 1.88 14.22 2.05L12 2.79L9.77 2.05L9.72 2.04C9.19 1.89 8.63 2.17 8.43 2.68L6 9H18L15.56 2.68L15.53 2.63Z"
            ></path>
          </svg>
          <div class="login__btn__text">Play Anonymously</div>
        </AppButton>
        <div class="login__warning">
          Watch out! The anonymous session will end after an hour of inactivity!
        </div>
        <div class="login__or">or</div>
        <div class="login__btns">
          <AppButton
            @click="loginWith('google')"
            color="#ee4134"
            hColor="#dd2112"
            class="login__btn login__btn--google"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
            >
              <title>Google</title>
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              />
            </svg>
            <div class="login__btn__text">Login with Google</div>
          </AppButton>
          <AppButton
            @click="loginWith('discord')"
            color="#7285d1"
            hColor="#4c64c4"
            class="login__btn login__btn--discord"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
            >
              <title>Discord</title>
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
              />
            </svg>
            <div class="login__btn__text">Login with Discord</div>
          </AppButton>
          <AppButton
            @click="loginWith('facebook')"
            color="#1877f2"
            hColor="#0b5fcc"
            class="login__btn login__btn--facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
            >
              <title>Facebook</title>
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <div class="login__btn__text">Login with Facbook</div>
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

$colors: (
  "anonymous": #080808,
  "google": #ee4134,
  "discord": #7285d1,
  "facebook": #1877f2
);

.login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  @keyframes fall {
    from {
      top: -30%;
    }

    to {
      top: 110%;
    }
  }

  @keyframes spin-right {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-left {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(-360deg);
    }
  }

  &__card {
    position: absolute;
    top: -30%;
    left: calc(var(--pos, 0) * 1%);
    z-index: -1;
    animation: fall linear calc(var(--fall-speed, 10000) * 1ms) forwards,
      spin-right linear calc(var(--rotate-speed, 8000) * 1ms) infinite;
    animation-delay: calc(var(--delay, 0) * 1ms);

    &--spin-left {
      animation: fall linear calc(var(--fall-speed, 10000) * 1ms) forwards,
        spin-left linear calc(var(--rotate-speed, 8000) * 1ms) infinite;
    }
  }

  &__container {
    padding: 24px;
    border: colors.$lightgray 1px solid;
    border-radius: 12px;
    background-color: rgba(colors.$main-bg, 85%);

    @include mixins.xs {
      border: none;
      border-radius: 0;
      width: 100%;
      height: 100%;
      padding-top: 20vh;
    }
  }

  &__captcha {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 0 32px;

    img {
      width: 124px;
      height: 124px;
    }

    h1 {
      font-size: 1.3rem;
      margin-bottom: 24px;
    }

    &__btn {
      overflow: hidden;
      border-radius: 4px;

      :deep(iframe) {
        vertical-align: middle;
      }
    }
  }

  &__logo {
    display: block;
    margin: 0;
    margin: 12px 0 30px 0;
    font-size: 1.2rem;
    text-align: center;
    text-decoration: none;
    color: colors.$text;
  }

  &__or {
    display: flex;
    align-items: center;
    color: colors.$lightgray;
    max-width: 235px;
    margin: auto;

    &::before,
    &::after {
      content: "";
      height: 1px;
      background-color: currentColor;
      flex-grow: 1;
    }

    &::before {
      margin-right: 5px;
    }

    &::after {
      margin-left: 5px;
    }
  }

  &__btns {
    width: fit-content;
    margin: auto;
  }

  &__btn {
    display: flex;
    align-items: center;
    width: 230px;
    margin-top: 14px;
    cursor: pointer;
    transition: all 100ms;

    @each $strategy, $color in $colors {
      &--#{$strategy} {
        @include colors.app-button($color);
      }
    }

    svg {
      fill: currentColor;
      width: 18px;
      height: 18px;
    }

    &__text {
      flex-grow: 1;
      text-align: center;
      font-size: 0.9rem;
    }
  }

  &__anonymous-btn {
    width: 200px;
    margin: auto;
    margin-bottom: 10px;
  }

  &__warning {
    max-width: 230px;
    font-size: 0.7rem;
    margin: auto;
    margin-bottom: 10px;
    text-align: center;
    color: lightgrey;
  }
}
</style>
