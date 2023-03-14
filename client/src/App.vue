<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue"
import PlayingCard from "./components/PlayingCard.vue"

function click() {
  console.log("click")
}
</script>

<template>
  <PlayingCard pack="TEST" color="black">
    Something something ____.
  </PlayingCard>
  <PlayingCard @click="click" pack="TEST 2"> Something. </PlayingCard>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped lang="scss"></style>
