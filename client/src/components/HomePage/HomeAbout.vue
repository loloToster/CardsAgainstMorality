<script setup lang="ts">
import { TITLE } from "@/consts"
</script>
<template>
  <div class="about" id="about">
    <!-- TODO: more detailed instruction and more about -->
    <h2>About</h2>
    <p>
      To play simply <RouterLink to="/room">Create a Room</RouterLink>, login
      anonymously or with your favourite platform, invite your friends to the
      room and have fun!
    </p>

    <h3>How to play?</h3>
    <ul>
      <li>To start the game, each player draws ten White Cards</li>
      <li>A Card Tsar is then selected and reads a random Black Card</li>
      <li>
        Everyone else fills in or answers the Black Card by submitting one White
        Card
      </li>
      <li>
        The cards are shuffled and the Tsar picks the funniest submittion, and
        whoever submitted it gets one point
      </li>
      <li>
        After the round, a new Tsar is selected and everyone draws up to ten
        White Cards
      </li>
    </ul>
    <p>
      <a class="about__instruction" href=""> More detailed instruction </a>
    </p>
    <p>
      {{ TITLE }} is an online
      <a
        href="https://www.cardsagainsthumanity.com/"
        target="_blank"
        rel="noopener noreferrer"
        >Cards Against Humanity</a
      >
      clone. Smth smth smth....
    </p>
    <div class="about__scroll">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
        <path
          d="M480 856 240 616l56-56 184 183 184-183 56 56-240 240Zm0-240L240 376l56-56 184 183 184-183 56 56-240 240Z"
        />
      </svg>
      <span> Keep scrolling to learn more </span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
        <path
          d="M480 856 240 616l56-56 184 183 184-183 56 56-240 240Zm0-240L240 376l56-56 184 183 184-183 56 56-240 240Z"
        />
      </svg>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.about {
  width: 1050px;
  max-width: 90vw;
  margin: 60px auto;
  scroll-margin-top: calc(vars.$header-height + 40px);

  h3 {
    margin-bottom: 8px;
  }

  p,
  ul {
    font-size: 1.175rem;
  }

  a {
    text-decoration: underline;
    color: inherit;
  }

  li:not(:last-child) {
    margin-bottom: 0.275em;
  }

  &__instruction {
    font-size: 0.875rem;
    color: colors.$primary !important;
    transform: color 200ms;

    &:hover {
      color: lighten(colors.$primary, 10%) !important;
    }
  }

  @keyframes point {
    from {
      transform: translateY(-10%);
    }

    to {
      transform: translateY(10%);
    }
  }

  &__scroll {
    display: flex;
    align-items: center;
    gap: max(12px, 3vw);
    width: fit-content;
    margin: auto;
    margin-top: 45px;
    text-align: center;
    font-size: 1.1rem;

    svg {
      fill: currentColor;
      width: 24px;
      height: 24px;

      animation: point 1s infinite alternate ease-in-out;
    }
  }
}
</style>
