<script setup lang="ts">
import { Dropdown } from "floating-vue"

import type { ApiUser } from "@backend/types"

import UserAvatar from "@/components/UserAvatar.vue"

withDefaults(defineProps<{ userDetails: ApiUser; placement?: string }>(), {
  placement: "left-start"
})
</script>

<template>
  <Dropdown
    :triggers="['click']"
    :distance="4"
    :placement="placement"
    shift
    flip
  >
    <slot>
      {{ userDetails.displayName }}
    </slot>
    <template #popper>
      <div class="user">
        <div class="user__main">
          <UserAvatar :user="userDetails" class="user__avatar" />
          <div class="user__names">
            <div class="user__display-name">{{ userDetails.displayName }}</div>
            <div class="user__username">@{{ userDetails.username }}</div>
          </div>
        </div>
        <div class="user__underdetails">
          <slot name="underdetails"></slot>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.user {
  padding: 12px;
  background-color: colors.$dark-surface;
  color: colors.$text;

  &__main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  &__display-name {
    font-size: 1.25rem;
  }

  &__username {
    color: colors.$lightgray;
    font-size: 0.875rem;
  }

  &__underdetails > :deep(:first-child) {
    margin-top: 8px;
  }
}
</style>
