<script setup lang="ts">
import DefaultAvatar from "@/assets/default-avatar.png"
import { User } from "@/types/user"

defineProps<{ user?: (Partial<User> & { name?: string }) | null }>()
defineEmits(["click"])
</script>

<template>
  <img
    @click="$emit('click')"
    :src="user?.picture ? user.picture : DefaultAvatar"
    :alt="`${
      user?.displayName ?? user?.name ?? user?.username ?? 'Anonymous'
    }'s avatar`"
  />
</template>

<style scoped lang="scss"></style>
