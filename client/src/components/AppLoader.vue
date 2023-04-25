<script setup lang="ts"></script>

<template>
  <div class="loader">
    <div class="loader__card"></div>
    <div class="loader__card"></div>
  </div>
</template>

<style scoped lang="scss">
.loader {
  position: relative;
  height: 34px;
  width: 24px;

  @keyframes loading {
    from {
      transform: rotate(-25deg);
    }

    to {
      transform: rotate(25deg);
    }
  }

  &__card {
    position: absolute;
    top: 0;
    left: 0;
    height: inherit;
    width: inherit;
    background-color: white;
    outline: 3px solid var(--outline, black);
    border-radius: 3px;
    transform-origin: 50% 200%;
    animation: loading 0.8s ease-in-out infinite;

    &:first-child {
      animation-direction: reverse;
    }
  }
}
</style>
