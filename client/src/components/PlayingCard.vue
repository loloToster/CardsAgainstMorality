<script setup lang="ts">
import { computed } from "vue"
import BlackCardIcon from "../assets/black-card-icon.svg?component"
import WhiteCardIcon from "../assets/white-card-icon.svg?component"

const props = withDefaults(
  defineProps<{
    text?: string
    pack?: string
    pick?: number
    draw?: number
    color?: "white" | "black"
    width?: number
  }>(),
  { color: "white" }
)
defineEmits(["click"])

const actions = computed(() => {
  if (props.color !== "black") return []

  return [
    { name: "DRAW", n: props.draw },
    { name: "PICK", n: props.pick }
  ].filter(a => a.n && a.n > 1)
})
</script>

<template>
  <div
    @click="$emit('click')"
    class="card"
    :class="color === 'white' ? 'card--white' : 'card--black'"
    :style="width ? { '--w': width + 'px' } : undefined"
  >
    <span class="card__text">
      <span v-if="text" v-html="text"></span>
      <slot v-else></slot>
    </span>
    <div class="card__bottom">
      <div class="card__pack">
        <BlackCardIcon v-if="color === 'white'" />
        <WhiteCardIcon v-else />
        <span>{{ pack }}</span>
      </div>
      <div class="card__actions">
        <div v-for="action in actions" class="card__action" :key="action.name">
          {{ action.name }}
          <div class="card__action__n">{{ action.n }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$default-card-height: 320px;
$default-card-width: 226px;

.card {
  --w: #{$default-card-width};

  --padding: calc(var(--w) * 0.081);
  --border-radius: calc(var(--w) * 0.049);
  --main-font-size: calc(var(--w) * 0.07);
  --pack-font-size: calc(var(--w) * 0.04);
  --pick-font-size: calc(var(--w) * 0.065);
  --main-icon-size: calc(var(--w) * 0.08);

  box-sizing: border-box;
  position: relative;

  display: flex;
  flex-direction: column;

  width: var(--w);
  aspect-ratio: 12 / 17;
  overflow: hidden;
  padding: var(--padding);

  border-radius: var(--border-radius);
  font-size: var(--main-font-size);
  line-height: 140%;
  font-weight: bold;
  box-shadow: -3px 3px 10px -2px #242424;

  &--white {
    color: black;
    background-color: white;
  }

  &--black {
    color: white;
    background-color: black;
  }

  &__text {
    flex-grow: 1;
    overflow-y: auto;
  }

  &__bottom {
    display: flex;
    align-items: end;
    gap: calc(var(--w) * 0.014);
    padding-top: calc(var(--w) * 0.02);

    svg {
      width: var(--main-icon-size);
      height: var(--main-icon-size);
    }
  }

  &__pack {
    display: flex;
    align-items: center;
    gap: calc(var(--w) * 0.014);
    font-size: var(--pack-font-size);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: calc(var(--w) * 0.014);
    margin-left: auto;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: calc(var(--w) * 0.016);
    font-size: var(--pick-font-size);

    &__n {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      height: calc(var(--w) * 0.085);
      width: calc(var(--w) * 0.085);

      // pick should not be in white cards
      background-color: white;
      color: black;
    }
  }
}
</style>
