<script setup lang="ts">
import { computed, reactive } from "vue"

import BlackCardIcon from "@/assets/black-card-icon.svg?component"
import WhiteCardIcon from "@/assets/white-card-icon.svg?component"

const props = withDefaults(
  defineProps<{
    text?: string
    pack?: string
    pick?: number
    draw?: number
    color?: "white" | "black"
    width?: number
    animated?: boolean
    glow?: boolean
  }>(),
  { color: "white" }
)

defineEmits<{
  (e: "click", ev: MouseEvent): void
  (e: "touchend", ev: TouchEvent): void
}>()

const actions = computed(() => {
  if (props.color !== "black") return []

  return [
    { name: "DRAW", n: props.draw },
    { name: "PICK", n: props.pick }
  ].filter(a => a.n && a.n > 1)
})

// HOVER ANIMATION:

const DEF_ROTATION = { x: 0, y: 0, a: 0 }
const DEF_GLOW = { x: "50%", y: "-20%" }
const animation = reactive({
  bounds: { x: -1, y: -1, w: -1, h: -1 },
  rotation: { ...DEF_ROTATION },
  glow: { ...DEF_GLOW }
})

function onMouseMove(e: MouseEvent) {
  const centerX = e.clientX - animation.bounds.x - animation.bounds.w / 2
  const centerY = e.clientY - animation.bounds.y - animation.bounds.h / 2
  const distance = Math.sqrt(centerX ** 2 + centerY ** 2)

  animation.rotation = {
    x: centerY / 100,
    y: -centerX / 100,
    a: Math.log(distance) * 2
  }

  animation.glow = {
    x: `${centerX * 2 + animation.bounds.w / 2}px`,
    y: `${centerY * 2 + animation.bounds.h / 2}px`
  }
}

function onMouseEnter(e: MouseEvent) {
  const card = e.target as HTMLDivElement
  const { x, y, width: w, height: h } = card.getBoundingClientRect()
  animation.bounds = { x, y, w, h }
}

function onMouseLeave() {
  animation.rotation = { ...DEF_ROTATION }
  animation.glow = { ...DEF_GLOW }
}
</script>

<template>
  <div class="card-perspective">
    <div
      @touchend="e => $emit('touchend', e)"
      @click="e => $emit('click', e)"
      @mouseenter="e => (animated ? onMouseEnter(e) : undefined)"
      @mousemove="e => (animated ? onMouseMove(e) : undefined)"
      @mouseleave="() => (animated ? onMouseLeave() : undefined)"
      :style="{
        '--w': width ? width + 'px' : undefined,
        '--x-rotation': animation.rotation.x,
        '--y-rotation': animation.rotation.y,
        '--a-rotation': animation.rotation.a
      }"
      class="card"
      :class="[`card--${color}`, { 'card--animated': animated }]"
      ref="card"
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
          <div
            v-for="action in actions"
            class="card__action"
            :key="action.name"
          >
            {{ action.name }}
            <div class="card__action__n">{{ action.n }}</div>
          </div>
        </div>
      </div>
      <div
        v-if="glow || animated"
        :style="{
          '--x': animation.glow.x,
          '--y': animation.glow.y
        }"
        class="card__glow"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

$default-card-height: 320px;
$default-card-width: 226px;

.card-perspective {
  --w: #{$default-card-width};
  perspective: 1500px;
}

.card {
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
  box-shadow: -3px 3px 10px -2px colors.$main-bg;

  &--animated {
    --scale: 1;

    transition-duration: 300ms;
    transition-property: transform, box-shadow;
    transition-timing-function: ease-out;
    transform: scale3d(var(--scale), var(--scale), var(--scale))
      rotate3d(
        var(--x-rotation, 0),
        var(--y-rotation, 0),
        0,
        calc(var(--a-rotation, 0) * 1deg)
      );

    &:hover {
      --scale: 1.07;

      transition-duration: 150ms;
      box-shadow: 0 5px 20px 5px #141414ab;
    }
  }

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
    line-height: 1.3;
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

  &__glow {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle at var(--x) var(--y),
      #ffffff19,
      #0000000f
    );
  }
}
</style>