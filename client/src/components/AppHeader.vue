<script setup lang="ts">
import { reactive, ref, computed } from "vue"
import { RouterLink } from "vue-router"
import { onClickOutside } from "@vueuse/core"

import { useUserStore } from "@/contexts/user"
import { TITLE } from "@/consts"

import AppButton from "./AppButton.vue"
import UserAvatar from "./UserAvatar.vue"

const user = useUserStore()

const state = reactive({ drawerOpen: false, profileMenuOpen: false })

const target = ref(null)

onClickOutside(target, () => (state.profileMenuOpen = false))

const nonAnonymousUser = computed(() => {
  return user.value && !user.value.anonymous
})
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
        <div class="header__logo__dev">Still in developement</div>
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
            <div>
              <div class="header__profile-menu__display-name">
                {{ user.value.displayName }}
              </div>
              <div class="header__profile-menu__username">
                @{{ user.value.username }}
              </div>
            </div>
          </div>
          <div
            v-if="nonAnonymousUser"
            class="header__profile-menu__divider"
          ></div>
          <RouterLink v-if="nonAnonymousUser" to="/account">
            <AppButton
              @click="state.profileMenuOpen = false"
              class="header__profile-menu__btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                  d="M480-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z"
                />
              </svg>
              <span>My account</span>
            </AppButton>
          </RouterLink>
          <RouterLink v-if="nonAnonymousUser" to="/my-packs">
            <AppButton
              @click="state.profileMenuOpen = false"
              class="header__profile-menu__btn"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M21.47,4.35L20.13,3.79V12.82L22.56,6.96C22.97,5.94 22.5,4.77 21.47,4.35M1.97,8.05L6.93,20C7.24,20.77 7.97,21.24 8.74,21.26C9,21.26 9.27,21.21 9.53,21.1L16.9,18.05C17.65,17.74 18.11,17 18.13,16.26C18.14,16 18.09,15.71 18,15.45L13,3.5C12.71,2.73 11.97,2.26 11.19,2.25C10.93,2.25 10.67,2.31 10.42,2.4L3.06,5.45C2.04,5.87 1.55,7.04 1.97,8.05M18.12,4.25A2,2 0 0,0 16.12,2.25H14.67L18.12,10.59"
                ></path>
              </svg>
              <span>My packs</span>
            </AppButton>
          </RouterLink>
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
      <RouterLink v-else to="/login">
        <AppButton class="header__login"> Login </AppButton>
      </RouterLink>
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

    position: relative;

    &__dev {
      position: absolute;
      width: fit-content;
      padding: 3px;
      background-color: colors.$error;
      font-size: 0.6em;
      font-weight: lighter;
      border-radius: 2px;
      right: 0;
      bottom: 0;
      transform: translate(15%, 70%) rotate(-3deg);
      transition: all 100ms;

      &:hover {
        font-size: 0.7em;
      }
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

      div {
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: bold;
        white-space: nowrap;
      }
    }

    &__username {
      font-size: 0.75rem;
      color: colors.$lightgray;
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
