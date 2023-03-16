<script setup lang="ts">
import { RouterLink } from "vue-router"
import type { LoggedInUser } from "../types/user"

defineProps<{ user: LoggedInUser }>()
</script>

<template>
  <header class="header">
    <RouterLink class="header__logo header__link" to="/">CAH</RouterLink>
    <img v-if="user" :src="user.picture" :alt="`${user.name} avatar`" />
    <RouterLink v-else class="header__login header__link" to="/login">
      Login
    </RouterLink>
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

  &__login {
    padding: 8px 18px;
    background-color: darkcyan;
    border-radius: 100vh;
    font-size: 1.2rem;
  }
}
</style>
