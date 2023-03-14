<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router"
import PlayingCard from "./components/PlayingCard.vue"

function click() {
  console.log("click")
}
</script>

<template>
  <ul>
    <li><RouterLink to="/">Home</RouterLink></li>
    <li><RouterLink to="/game">Game</RouterLink></li>
  </ul>
  <PlayingCard pack="TEST" color="black">
    Something something ____.
  </PlayingCard>
  <PlayingCard @click="click" pack="TEST 2"> Something. </PlayingCard>
  <RouterView />
</template>

<style scoped lang="scss"></style>
