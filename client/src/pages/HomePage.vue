<script setup lang="ts">
import { TITLE } from "@/consts"

import HomeLanding from "@/components/HomePage/HomeLanding.vue"
import HomeAbout from "@/components/HomePage/HomeAbout.vue"
import HomeVariety from "@/components/HomePage/HomeVariety.vue"
import HomeCustom from "@/components/HomePage/HomeCustom.vue"
</script>

<template>
  <div class="home">
    <h1>{{ TITLE }}</h1>
    <p class="home__brief">
      The best online
      <a
        href="https://www.cardsagainsthumanity.com/"
        target="_blank"
        rel="noopener noreferrer"
        >Cards Against Humanity</a
      >
      experience
    </p>
    <HomeLanding />
    <HomeAbout />
    <HomeVariety />
    <HomeCustom />
  </div>
</template>

<style scoped lang="scss">
.home {
  h1 {
    text-align: center;
    margin-top: 8vh;
    font-size: clamp(1.2rem, 10vw, 64px);
    padding: 0 12px;
  }

  :deep(h2) {
    font-size: clamp(1.3rem, 4vw, 2rem);
  }

  :deep(h3) {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
  }

  &__brief {
    text-align: center;
    font-size: clamp(1rem, 4vw, 1.5rem);
    padding: 0 10vw;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
