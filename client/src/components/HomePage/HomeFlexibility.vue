<script setup lang="ts">
import Land from "@/assets/earth.svg?component"
</script>
<template>
  <div class="flexibility">
    <div class="flexibility__graphic">
      <svg
        class="flexibility__svg flexibility__svg--monitor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
      >
        <path
          d="M240-120v-80l40-40H160q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H680l40 40v80H240Zm-80-200h640v-440H160v440Zm0 0v-440 440Z"
        />
      </svg>
      <svg
        class="flexibility__svg flexibility__svg--laptop"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style=""
      >
        <path
          d="M80-120q-17 0-28.5-11.5T40-160q0-17 11.5-28.5T80-200h800q17 0 28.5 11.5T920-160q0 17-11.5 28.5T880-120H80Zm80-120q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H160Zm0-80h640v-440H160v440Zm0 0v-440 440Z"
        />
        <path fill="white" d="M 164 -755 L 796 -754 L 790 -325 L 168 -327" />
      </svg>
      <svg
        class="flexibility__svg flexibility__svg--phone"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
      >
        <path
          d="M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v720q0 33-23.5 56.5T680-40H280Zm0-200v120h400v-120H280Zm200 100q17 0 28.5-11.5T520-180q0-17-11.5-28.5T480-220q-17 0-28.5 11.5T440-180q0 17 11.5 28.5T480-140ZM280-320h400v-400H280v400Zm0-480h400v-40H280v40Zm0 560v120-120Zm0-560v-40 40Z"
        />
        <path fill="white" d="M 282 -718 L 678 -717 L 677 -322 L 283 -322" />
      </svg>
      <div class="flexibility__earth">
        <div class="flexibility__earth__sea">
          <Land class="flexibility__earth__land" />
          <Land class="flexibility__earth__land" />
        </div>
      </div>
    </div>
    <div class="flexibility__text-wrapper">
      <h2>Play<br />wherever & however<br />you want</h2>
      <p>
        This app was designed<br />to work on any device and wherever<br />you
        might be.
      </p>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as c;
@use "@/styles/mixins" as mixins;

.flexibility {
  display: flex;
  align-items: center;
  height: 70vh;
  width: 900px;
  max-width: 90vw;
  margin: auto;

  @include mixins.sm {
    flex-direction: column;
    justify-content: center;
  }

  &__graphic {
    position: relative;
    width: 19vw;
    height: 19vw;

    @include mixins.sm {
      width: 40vw;
      height: 40vw;
    }
  }

  &__svg {
    aspect-ratio: 1;
    fill: gray;
    filter: drop-shadow(5px 0 0 c.$main-bg) drop-shadow(0 5px 0 c.$main-bg)
      drop-shadow(-5px 0 0 c.$main-bg) drop-shadow(0 -5px 0 c.$main-bg);

    path[fill="white"] {
      fill: c.$main-bg;
    }

    &--monitor {
      width: 100%;
    }

    &--laptop {
      position: absolute;
      right: -21%;
      bottom: 0;
      width: 65%;
    }

    &--phone {
      position: absolute;
      left: -11%;
      bottom: 7%;
      width: 40%;
    }
  }

  &__earth {
    position: absolute;
    bottom: 25%;
    right: 1%;
    overflow: hidden;
    width: 21%;
    height: 21%;
    border-radius: 50%;

    @keyframes rotate {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(-50%);
      }
    }

    &__sea {
      display: flex;
      align-items: center;
      height: 100%;
      width: fit-content;
      background-color: #218bd9;
      animation: rotate 8s linear infinite;
    }

    &__land {
      flex-shrink: 0;
      height: 90%;
    }
  }

  &__text-wrapper {
    margin-left: min(200px, 20vw);

    @include mixins.sm {
      text-align: center;
      margin: 0;
      margin: clamp(30px, 5vh, 60px) 0;
    }

    p {
      font-size: clamp(1rem, 2.6vw, 1.3rem);
    }
  }
}
</style>
