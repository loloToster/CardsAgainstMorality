<script setup lang="ts">
import AppLoader from "./AppLoader.vue"
</script>

<template>
  <div class="loading">
    <AppLoader class="loading__loader" />
    <span>
      <slot>Loading...</slot>
    </span>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins" as mixins;
@use "@/styles/colors" as colors;

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin: auto;
  margin-top: 20vh;
  padding: 48px;
  border: #c0c0c0 3px solid;
  border-radius: 12px;

  @include mixins.xs {
    border: none;
  }

  span {
    margin-top: 30px;
    font-size: 1.6rem;
    text-align: center;
  }

  &__loader {
    --outline: #{colors.$main-bg};
  }
}
</style>
