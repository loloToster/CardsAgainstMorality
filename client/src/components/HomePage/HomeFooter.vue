<script setup lang="ts"></script>
<template>
  <footer class="footer">
    Made by
    <a
      href="https://github.com/loloToster"
      target="_blank"
      rel="noopener noreferrer"
    >
      loloToster
    </a>
  </footer>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;

.footer {
  margin-top: 12px;
  padding: 2vh 3vw;
  border-top: 1px solid colors.$darkgray;

  a {
    color: inherit;
    font-style: italic;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
