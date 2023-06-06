<script setup lang="ts">
import { reactive, ref } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { Dropdown, destroyTooltip } from "floating-vue"

import { user } from "@/contexts/user"

const route = useRoute()

const emit = defineEmits<{ (ev: "change", liked: boolean): void }>()
const props = defineProps<{ liked: boolean }>()

const state = reactive({
  liked: props.liked,
  mouseover: false,
  showTooltip: false,
  interacted: false,
  showLoginTooltip: false
})

const btn = ref<HTMLButtonElement>()

function handleClick() {
  state.interacted = true
  destroyTooltip(btn.value)
  state.showTooltip = false

  if (!user.value || user.value.anonymous) {
    state.showLoginTooltip = true
    return
  }

  state.liked = !state.liked
  emit("change", state.liked)
}

function handleMouseEnter() {
  if (state.mouseover) return

  state.mouseover = true
  state.showTooltip = true
}

function handleMouseLeave() {
  state.mouseover = false
  state.showTooltip = false
}
</script>

<template>
  <Dropdown
    class="wrapper"
    @hide="state.showLoginTooltip = false"
    :shown="state.showLoginTooltip"
    :triggers="[]"
  >
    <button
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="like"
      :class="{
        liked: state.liked,
        active: state.interacted && state.liked,
        inactive: state.interacted && !state.liked
      }"
      ref="btn"
      v-tooltip="{
        delay: { show: 100, hide: 0 },
        content: state.liked ? 'Remove from favourites' : 'Add to favourites',
        triggers: [],
        shown: state.showTooltip
      }"
    >
      <svg
        v-if="state.liked"
        class="like__filled"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 96 960 960"
      >
        <path
          d="m479.761 943.131-45.065-40.587q-106.718-97.718-176.077-168.696-69.358-70.978-110.597-126.957-41.24-55.978-57.74-101.576-16.5-45.598-16.5-92.315 0-92.63 62.174-154.924 62.174-62.294 153.805-62.294 56.761 0 105.141 26.283 48.381 26.283 84.859 76.326 42.478-53.043 89.239-77.826 46.761-24.783 100.761-24.783 91.869 0 154.163 62.294Q886.218 320.37 886.218 413q0 46.717-16.5 92.196-16.5 45.478-57.74 101.456-41.239 55.978-110.717 127.076-69.478 71.098-176.196 168.816l-45.304 40.587Z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="like__outlined"
        viewBox="0 96 960 960"
      >
        <path
          d="m479.761 943.131-45.065-40.587Q328.21 804.705 258.735 733.787q-69.474-70.917-110.713-126.896-41.24-55.978-57.74-101.576-16.5-45.598-16.5-92.338 0-92.802 62.212-154.998 62.212-62.197 153.767-62.197 56.83 0 105.176 26.283 48.346 26.283 84.824 76.326 42.478-53.043 89.247-77.826 46.769-24.783 100.753-24.783 91.961 0 154.209 62.204Q886.218 320.189 886.218 413q0 46.71-16.5 92.192-16.5 45.482-57.74 101.46-41.239 55.978-110.801 127.043-69.562 71.064-176.112 168.849l-45.304 40.587Zm-.12-89.761q101.117-92.996 166.26-159.139 65.142-66.144 103.403-115.785 38.261-49.642 53.522-88.454 15.261-38.812 15.261-76.842 0-65.193-41.489-107.215-41.488-42.022-106.496-42.022-50.923 0-94.415 31.62-43.491 31.619-70.491 88.38h-51.631q-25.94-56-69.63-88t-94.36-32q-64.684 0-106.053 41.868-41.37 41.868-41.37 107.535 0 38.466 15.366 77.744t53.642 89.392q38.275 50.113 103.677 115.754 65.402 65.642 164.804 157.164Zm.598-294.848Z"
        />
      </svg>
    </button>
    <template #popper>
      <div class="login-to-like">
        <div>
          Log in non-anonymously to add
          <br />
          this pack to favourites
        </div>
        <RouterLink
          :to="`/login?returnTo=${encodeURIComponent(route.fullPath)}`"
        >
          Log in
        </RouterLink>
      </div>
    </template>
  </Dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.wrapper {
  width: fit-content;
}

.like {
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;

  @keyframes shake {
    from,
    to {
      transform: rotate(0);
    }

    33% {
      transform: rotate(-7deg);
    }

    66% {
      transform: rotate(7deg);
    }

    90% {
      transform: rotate(-2deg);
    }
  }

  &.inactive {
    transform-origin: center 200%;
    animation: shake 300ms;
  }

  &::before {
    z-index: -1;
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    transform: translate(-50%, -50%);
    border-radius: 50%;

    outline-style: solid;
    outline-color: colors.$liked;
    outline-width: 0;
  }

  @keyframes glow {
    from {
      outline-width: 0;
      outline-offset: 0;
      opacity: 0.8;
    }

    30% {
      outline-width: 10px;
    }

    to {
      outline-offset: 40px;
      opacity: 0;
      outline-width: 0;
    }
  }

  &.active::before {
    animation: glow 400ms ease-out;
  }

  svg {
    width: 100%;
    height: 100%;
    fill: colors.$lightgray;
    transition: fill 100ms;
  }

  &:hover svg {
    fill: colors.$subtext;
  }

  &.liked svg {
    fill: colors.$liked;
  }

  @keyframes pop {
    from,
    to {
      scale: 1;
    }

    30% {
      scale: 0.6;
    }

    80% {
      scale: 1.08;
    }
  }

  &.active &__filled {
    animation: pop 300ms ease-in;
  }
}

.login-to-like {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 12px;
  padding: 12px;
  background-color: colors.$primary;
  color: colors.$text;

  div {
    font-size: 0.9rem;
  }

  a {
    margin-right: 12px;
    color: inherit;
    font-size: 1.2rem;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
