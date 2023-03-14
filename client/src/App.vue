<script setup lang="ts">
import { RouterView } from "vue-router"
import AppHeader from "./components/AppHeader.vue"
</script>

<template>
  <AppHeader v-if="$route.name !== 'Login'" />
  <RouterView />
</template>

<style scoped lang="scss"></style>
