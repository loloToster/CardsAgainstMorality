<script setup lang="ts">
import { onUnmounted } from "vue"
import { useRoute } from "vue-router"

import { setAuth as setSocketAuth, socket } from "../contexts/socket"
import PlayingCard from "../components/PlayingCard.vue"

const route = useRoute()

setSocketAuth({ roomId: route.params.id })
socket.connect()

onUnmounted(() => {
  socket.disconnect()
})
</script>

<template>
  <div class="game">
    <div class="game__top">
      <div class="game__table">
        <div class="game__table__cards">
          <PlayingCard pack="" color="black"> Something ____. </PlayingCard>
          <PlayingCard v-for="i in 2" pack="" color="white" :key="i">
            Something.
          </PlayingCard>
        </div>
        <div class="game__choices">
          <div v-for="i in 3" class="game__choices__choice" :key="i">
            {{ i }}
          </div>
        </div>
      </div>
      <div class="game__players">
        <div v-for="i in 5" class="game__players__player" :key="i">
          <img src="" alt="" />
          <span>{{ i }}</span>
        </div>
      </div>
    </div>
    <div class="game__hand">
      <div v-for="i in 10" class="game__hand__card-wrapper" :key="i">
        <PlayingCard class="game__hand__card" pack="" color="white">
          {{ i }}
        </PlayingCard>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$main-gap: 20px;
.game {
  width: 90vw;
  max-width: 1100px;
  margin: auto;

  &__top {
    display: flex;
    gap: $main-gap;
    margin-bottom: $main-gap * 2;
  }

  &__table {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: $main-gap;
    flex-grow: 1;
    min-width: 0;

    &__cards {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }

  &__choices {
    display: flex;
    position: relative;
    justify-content: center;
    gap: 16px;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
    margin: auto;

    &__choice {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      flex-shrink: 0;
      width: 56px;
      height: 80px;
      // margin to make space for pseudo-elements
      margin-left: 12px;

      color: black;
      background-color: white;
      box-shadow: -2px 1px 7px 0 #262626;
      border-radius: 4px;
      font-size: 1.8rem;
      font-weight: bold;
      cursor: pointer;
      transition: font-size 100ms linear;

      &.active {
        font-size: 3.3rem;
      }

      &::before,
      &::after {
        content: "";
        position: absolute;

        width: 100%;
        height: 100%;
        top: 0;

        border-radius: inherit;
        background-color: inherit;
        box-shadow: inherit;
        cursor: pointer;
      }

      &::before {
        left: -6px;
        z-index: -1;
      }

      &::after {
        left: -12px;
        z-index: -2;
      }
    }
  }

  &__players {
    width: 220px;
    max-height: 320px;
    flex-shrink: 0;
    overflow-y: auto;

    &__player {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: #4c4c4c;
      margin-bottom: 8px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 32px;
        height: 32px;
        background-color: gray;
        border-radius: 50%;
        flex-shrink: 0;
      }

      span {
        white-space: nowrap;
      }
    }
  }

  &__hand {
    display: flex;
    margin: auto;

    &__card-wrapper {
      flex: 1 1 0;
      min-width: 0;

      &:last-child {
        flex: unset;
      }
    }

    &__card {
      position: relative;
      cursor: pointer;
      transition: transform ease-in-out 100ms;

      &::after {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        height: 0;
        width: 100%;
        transform: translateY(100%);
        transition: height ease-in-out 100ms;
      }

      &:hover,
      &.active {
        transform: translateY(-60%);

        &::after {
          height: 60%;
        }
      }
    }
  }
}
</style>
