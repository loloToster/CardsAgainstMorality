<script setup lang="ts">
import { useHead } from "@unhead/vue"

import { TITLE } from "@/consts"

import HomeLanding from "@/components/HomePage/HomeLanding.vue"
import HomeAbout from "@/components/HomePage/HomeAbout.vue"
import HomeFlexibility from "@/components/HomePage/HomeFlexibility.vue"
import HomeVariety from "@/components/HomePage/HomeVariety.vue"
import HomeCustom from "@/components/HomePage/HomeCustom.vue"

useHead({
  title: "Home",
  meta: [
    {
      name: "description",
      content:
        "The best online Cards Against Humanity experience. Play Cards Against Humanity online with your friends!"
    }
  ]
})
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
    <HomeFlexibility />
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
