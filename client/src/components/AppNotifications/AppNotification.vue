<script setup lang="ts">
import { useNotificationsStore, Notification } from "@/contexts/notifications"

const props = defineProps<{ notification: Notification }>()

const notifications = useNotificationsStore()

function remove() {
  notifications.remove(props.notification.id)
}
</script>

<template>
  <div class="notification" :class="`notification--${notification.type}`">
    <div class="notification__main">{{ notification.text }}</div>
    <button @click="remove" class="notification__close">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
        <path
          d="m249 873-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z"
        />
      </svg>
    </button>
    <div @animationend="remove" class="notification__progress"></div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

$colors: (
  "info": colors.$blue,
  "success": colors.$lime,
  "warn": colors.$warn,
  "error": colors.$error
);

.notification {
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
  width: 300px;
  padding: 12px;
  border-radius: 4px;
  overflow: hidden;

  @include mixins.sm {
    width: 100%;
  }

  @each $type, $color in $colors {
    &--#{$type} {
      background-color: $color;
      --progress-color: #{darken($color, 10%)};
    }
  }

  @keyframes progress {
    from {
      width: 0;
    }

    to {
      width: 100%;
    }
  }

  &__close {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    cursor: pointer;

    svg {
      width: 100%;
      height: 100%;
      fill: white;
    }
  }

  &__progress {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 5px;
    background-color: var(--progress-color);
    animation: progress 10s linear forwards;
  }
}
</style>
