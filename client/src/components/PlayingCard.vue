<script setup lang="ts">
import { computed, reactive } from "vue"

import { CardColor } from "@backend/types"
import { MAX_DRAW, MIN_DRAW, MIN_PICK, MAX_PICK } from "@backend/consts"
import { range } from "@/utils"

import BlackCardIcon from "@/assets/black-card-icon.svg?component"
import WhiteCardIcon from "@/assets/white-card-icon.svg?component"

const props = withDefaults(
  defineProps<{
    text?: string
    pack?: string
    pick?: number | null
    draw?: number | null
    color?: CardColor
    width?: number
    animated?: boolean
    glow?: boolean
    editableActions?: boolean
  }>(),
  { color: "white" }
)

defineEmits<{
  (e: "click", ev: MouseEvent): void
  (e: "touchend", ev: TouchEvent): void
  (e: "pick", n: number): void
  (e: "draw", n: number): void
}>()

const possibleDraw = range(MIN_DRAW, MAX_DRAW)
const possiblePick = range(MIN_PICK, MAX_PICK)

const actions = computed(() => {
  if (props.color !== "black") return []

  const a = []

  if (
    props.editableActions ||
    (typeof props.draw === "number" && props.draw > MIN_DRAW)
  ) {
    const num = props.draw ?? MIN_DRAW

    a.push({
      name: "draw",
      n: num,
      opts: props.editableActions ? possibleDraw.filter(n => n !== num) : []
    })
  }

  if (
    props.editableActions ||
    (typeof props.pick === "number" && props.pick > MIN_PICK)
  ) {
    const num = props.pick ?? MIN_PICK

    a.push({
      name: "pick",
      n: num,
      opts: props.editableActions ? possiblePick.filter(n => n !== num) : []
    })
  }

  return a
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
  <div
    class="card-wrapper"
    :style="{
      '--w': width ? width + 'px' : undefined
    }"
  >
    <div
      @touchend="e => $emit('touchend', e)"
      @click="e => $emit('click', e)"
      @mouseenter="e => (animated ? onMouseEnter(e) : undefined)"
      @mousemove="e => (animated ? onMouseMove(e) : undefined)"
      @mouseleave="() => (animated ? onMouseLeave() : undefined)"
      :style="{
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
          <BlackCardIcon v-if="color === 'white'" class="card__pack__icon" />
          <WhiteCardIcon v-else class="card__pack__icon" />
          <span class="card__pack__name">{{ pack }}</span>
        </div>
        <div class="card__actions">
          <div
            v-for="action in actions"
            class="card__action"
            :class="{ 'card__action--editable': props.editableActions }"
            :key="action.name"
          >
            {{ action.name }}
            <div class="card__action__n-wrapper">
              <div
                v-if="props.editableActions"
                class="card__action__hover-catcher"
              ></div>
              <div class="card__action__n">{{ action.n }}</div>
              <div
                v-for="opt in action.opts"
                @click="$emit(action.name, opt)"
                class="card__action__n"
                :key="opt"
              >
                {{ opt }}
              </div>
            </div>
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
@use "@/styles/variables" as vars;

.card-wrapper {
  --width: var(
    --w,
    calc(
      var(--h, #{vars.$default-card-height}) / #{vars.$card-aspect-height} * #{vars.$card-aspect-width}
    )
  );

  perspective: 1500px;
}

.card {
  --padding: calc(var(--width) * 0.081);
  --border-radius: calc(var(--width) * 0.049);
  --main-font-size: calc(var(--width) * 0.07);
  --pack-font-size: calc(var(--width) * 0.04);
  --pick-font-size: calc(var(--width) * 0.065);
  --main-icon-size: calc(var(--width) * 0.08);
  --bottom-top-gap: calc(var(--width) * 0.016);
  --bottom-gap: calc(var(--width) * 0.014);
  --action-gap: calc(var(--width) * 0.016);
  --n-size: calc(var(--width) * 0.085);

  width: var(--width);
  aspect-ratio: vars.$card-aspect-ratio;

  box-sizing: border-box;
  position: relative;

  display: flex;
  flex-direction: column;

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

    :deep(b) {
      font-weight: bolder;
    }
  }

  &__bottom {
    display: flex;
    align-items: end;
    gap: var(--bottom-gap);
    padding-top: var(--bottom-top-gap);

    svg {
      width: var(--main-icon-size);
      height: var(--main-icon-size);
    }
  }

  &__pack {
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: var(--bottom-gap);
    font-size: var(--pack-font-size);
    line-height: 1.3;

    &__icon {
      flex-shrink: 0;
    }

    &__name {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: var(--bottom-gap);
    margin-left: auto;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: var(--action-gap);
    font-size: var(--pick-font-size);
    text-transform: uppercase;

    &--editable {
      cursor: pointer;
    }

    $n-opts: 3;

    &__n-wrapper {
      position: relative;
      height: var(--n-size);
      width: var(--n-size);
    }

    &__hover-catcher {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: var(--n-size);
    }

    &:hover &__hover-catcher {
      width: calc(var(--n-size) * $n-opts + var(--action-gap) * ($n-opts - 1));
    }

    &__n {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      height: var(--n-size);
      width: var(--n-size);
      transition: left 100ms;

      // pick & draw should not be in white cards
      background-color: white;
      color: black;

      &:nth-child(2) {
        z-index: 1;
      }
    }

    &:hover &__n {
      // +1 because of hover catcher
      @for $i from 2 through $n-opts + 1 {
        &:nth-child(#{$i}) {
          left: calc(var(--n-size) * ($i - 2) + var(--action-gap) * ($i - 2));
        }
      }
    }
  }

  &__glow {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: inherit;
    pointer-events: none;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-image: radial-gradient(
        circle at var(--x) var(--y),
        #ffffff19,
        #0000000f
      );
    }
  }
}
</style>
