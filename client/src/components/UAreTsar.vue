<script setup lang="ts"></script>

<template>
  <div class="tsar">
    You are the
    <div ref="goldenText" class="tsar__gold">Tsar</div>
  </div>
</template>

<style scoped lang="scss">
.tsar {
  font-size: 2.4rem;
  font-weight: bold;
  letter-spacing: 1px;

  @keyframes flare {
    from {
      background-position: -15ch;
    }

    to {
      background-position: 15ch;
    }
  }

  &__gold {
    position: relative;
    display: inline-block;
    background-image: linear-gradient(
      70deg,
      #c98218 0,
      #dbb809 30%,
      #d8cf48 50%,
      #dbb809 80%,
      #c98218 100%
    );
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;

    &::before {
      content: "Tsar";
      position: absolute;
      top: 0;
      left: 0;
      background-image: linear-gradient(
        65deg,
        transparent 20%,
        rgba(255, 255, 255, 0.5) 20%,
        rgba(255, 255, 255, 0.5) 27%,
        transparent 27%,
        transparent 100%
      );
      background-repeat: no-repeat;
      background-clip: text;
      -webkit-background-clip: text;
      animation: flare 6s infinite linear;
    }
  }
}
</style>
