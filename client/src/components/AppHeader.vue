<script setup lang="ts">
import { reactive, ref } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { onClickOutside } from "@vueuse/core"

import { user } from "@/contexts/user"
import { TITLE } from "@/consts"

import AppButton from "./AppButton.vue"
import UserAvatar from "./UserAvatar.vue"

const router = useRouter()

const state = reactive({ drawerOpen: false, profileMenuOpen: false })

const target = ref(null)

onClickOutside(target, () => (state.profileMenuOpen = false))
</script>

<template>
  <div
    @click="state.drawerOpen = false"
    class="drawer"
    :class="{ active: state.drawerOpen }"
  >
    <div class="drawer__content" :class="{ active: state.drawerOpen }">
      <RouterLink to="/" class="drawer__logo">
        <div v-for="word in TITLE.split(' ')" :key="word">
          {{ word }}
        </div>
      </RouterLink>
      <RouterLink to="/rooms" class="drawer__btn" v-wave> Rooms </RouterLink>
      <RouterLink to="/packs" class="drawer__btn" v-wave> Packs </RouterLink>
    </div>
  </div>
  <header class="header">
    <div class="header__content">
      <button @click="state.drawerOpen = true" class="header__burger" v-wave>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path
            d="M115.935-233.304v-68.131h728.13v68.131h-728.13Zm0-212.631v-68.13h728.13v68.13h-728.13Zm0-212.63v-68.37h728.13v68.37h-728.13Z"
          />
        </svg>
      </button>
      <RouterLink class="header__logo" to="/">
        {{ TITLE }}
      </RouterLink>
      <RouterLink class="header__link" to="/rooms"> Rooms </RouterLink>
      <RouterLink class="header__link" to="/packs"> Packs </RouterLink>
      <div
        @click="state.profileMenuOpen = !state.profileMenuOpen"
        v-if="user.value"
        class="header__profile"
        ref="target"
      >
        <UserAvatar :user="user.value" class="header__avatar" />
        <div
          v-if="state.profileMenuOpen"
          @click="e => e.stopPropagation()"
          class="header__profile-menu"
        >
          <div class="header__profile-menu__details">
            <UserAvatar :user="user.value" />
            <span>{{ user.value.name }}</span>
          </div>
          <div class="header__profile-menu__divider"></div>
          <a href="/auth/logout">
            <AppButton class="header__profile-menu__btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                <path
                  d="M179 961q-39.462 0-67.231-27.475Q84 906.05 84 867V285q0-39.463 27.769-67.231Q139.538 190 179 190h298v95H179v582h298v94H179Zm488-174-68-66 98-98H362v-94h333l-98-98 68-66 211 212-209 210Z"
                />
              </svg>
              <span>Log Out</span>
            </AppButton>
          </a>
        </div>
      </div>
      <AppButton v-else @click="router.push('/login')" class="header__login">
        Login
      </AppButton>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as vars;
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.drawer {
  display: none;
  z-index: 2;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  pointer-events: none;
  transition: background-color 200ms;

  @include mixins.xs {
    display: block;
  }

  &.active {
    background-color: colors.$modal-bg;
    pointer-events: all;
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 60vw;
    background-color: colors.$light-surface;
    transform: translateX(-100%);
    transition: transform 200ms;

    &.active {
      transform: translateX(0);
    }
  }

  &__logo {
    display: block;
    padding: 4vw;
    font-size: clamp(1.2rem, 12vw, 1.8rem);
    letter-spacing: 0.09em;
    font-weight: bold;
    line-height: 1;
    color: inherit;
    text-decoration: none;
  }

  &__btn {
    display: block;
    color: inherit;
    text-decoration: none;
    padding: 12px 32px;
  }
}

.header {
  position: sticky;
  top: 0;
  background-color: colors.$main-bg;
  border-bottom: 1px solid colors.$darkgray;
  height: vars.$header-height;
  z-index: 1;

  &__content {
    display: flex;
    align-items: center;
    gap: 2vw;
    width: 90vw;
    max-width: 1200px;
    margin: auto;
    height: 100%;

    @include mixins.xs {
      justify-content: space-between;
    }
  }

  &__burger {
    display: none;

    @include mixins.xs {
      display: block;
    }

    svg {
      min-width: 24px;
      width: 5vw;
      max-width: 42px;
      fill: currentColor;
    }
  }

  &__link {
    font-size: 1.1rem;
    text-decoration: none;
    color: colors.$subtext;

    &:hover {
      text-decoration: underline;
    }

    @include mixins.xs {
      display: none;
    }
  }

  &__logo {
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    color: colors.$text;
    font-weight: 600;
    margin-right: auto;
    text-decoration: none;
    text-align: center;

    @include mixins.xs {
      margin-right: unset;
    }
  }

  &__login {
    @include colors.app-button(colors.$primary);
  }

  &__avatar {
    min-width: 24px;
    width: 5vw;
    max-width: 42px;
    aspect-ratio: 1;
    border-radius: 50%;
    cursor: pointer;
  }

  &__profile {
    position: relative;
  }

  &__profile-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 200px;
    max-width: min(90vw, 300px);
    padding: 12px;
    background-color: colors.$dark-surface;
    border-radius: 6px;

    a {
      text-decoration: none;
    }

    &__divider {
      width: 100%;
      height: 1px;
      margin: 8px 0;
      background-color: colors.$darkgray;
    }

    &__details {
      display: flex;
      align-items: center;
      gap: 12px;

      :deep(img) {
        height: 58px;
        width: 58px;
        border-radius: 50%;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: bold;
        white-space: nowrap;
      }
    }

    &__btn {
      display: flex;
      gap: 8px;
      width: 100%;
      font-size: 0.8rem;
      font-weight: bold;
      padding: 8px;

      --color: transparent;

      svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
    }
  }
}
</style>
