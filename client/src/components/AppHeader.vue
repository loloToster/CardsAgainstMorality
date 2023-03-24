<script setup lang="ts">
import { reactive, ref } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { onClickOutside } from "@vueuse/core"

import type { LoggedInUser } from "../types/user"

import AppButton from "./AppButton.vue"

const router = useRouter()

defineProps<{ user: LoggedInUser }>()

const state = reactive({ profileMenuOpen: false })

function logout() {
  window.location.replace("/auth/logout")
}

const target = ref(null)

onClickOutside(target, () => (state.profileMenuOpen = false))
</script>

<template>
  <header class="header">
    <RouterLink class="header__logo header__link" to="/">CAH</RouterLink>
    <div
      @click="state.profileMenuOpen = !state.profileMenuOpen"
      v-if="user"
      class="header__profile"
      ref="target"
    >
      <img
        :src="user.picture"
        :alt="`${user.name} avatar`"
        class="header__avatar"
      />
      <div
        v-if="state.profileMenuOpen"
        @click="e => e.stopPropagation()"
        class="header__profile-menu"
      >
        <div class="header__profile-menu__details">
          <img :src="user.picture" :alt="`${user.name} avatar`" />
          <span>{{ user.name }}</span>
        </div>
        <div class="header__profile-menu__divider"></div>
        <AppButton
          @click="logout"
          color="transparent"
          class="header__profile-menu__btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
            <path
              d="M179 961q-39.462 0-67.231-27.475Q84 906.05 84 867V285q0-39.463 27.769-67.231Q139.538 190 179 190h298v95H179v582h298v94H179Zm488-174-68-66 98-98H362v-94h333l-98-98 68-66 211 212-209 210Z"
            />
          </svg>
          <span>Log Out</span>
        </AppButton>
      </div>
    </div>
    <AppButton
      v-else
      @click="router.push('/login')"
      class="header__link"
      color="darkcyan"
      h-color="#007676"
    >
      Login
    </AppButton>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  padding: 16px 13vw;
  background-color: transparent;

  &__link {
    text-decoration: none;
    color: white;
  }

  &__logo {
    font-size: 1.6rem;
    font-weight: 600;
    margin-right: auto;
  }

  &__avatar {
    height: 52px;
    width: 52px;
    border-radius: 50%;
    cursor: pointer;
  }

  &__profile {
    position: relative;
  }

  &__profile-menu {
    position: absolute;
    z-index: 1;
    top: 100%;
    right: 0;
    min-width: 200px;
    max-width: 300px;
    padding: 12px;
    background-color: #0f0f0f;
    border-radius: 6px;

    &__divider {
      width: 100%;
      height: 1px;
      margin: 8px 0;
      background-color: #4e4e4e;
    }

    &__details {
      display: flex;
      align-items: center;
      gap: 12px;

      img {
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

      svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
    }
  }
}
</style>
