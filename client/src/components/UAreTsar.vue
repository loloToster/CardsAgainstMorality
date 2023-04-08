<script setup lang="ts"></script>

<template>
  <div class="tsar">
    You are the
    <div ref="goldenText" class="tsar__gold">Tsar</div>
  </div>
</template>

<style scoped lang="scss">
.tsar {
  font-size: clamp(1.6rem, 5.5vw, 2.4rem);
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
      #dc942e 0,
      #ecc91b 30%,
      #f6ee74 50%,
      #ecc91b 80%,
      #dc942e 100%
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
