<script setup lang="ts">
import { reactive, ref, computed, onUnmounted, watch } from "vue"

const INTERVAL = 1000

const props = withDefaults(
  defineProps<{
    from?: number
    shakeInterval?: number
    shakeBoundry?: number
    warningBoundry?: number
  }>(),
  { from: 60, shakeInterval: 3, shakeBoundry: 0, warningBoundry: 0 }
)

const state = reactive({ counter: props.from })
const wrapper = ref<HTMLDivElement>()
const timer = ref<HTMLDivElement>()

function runShakeAnimation() {
  if (!timer.value) return

  timer.value.classList.remove("shake")
  void timer.value.offsetWidth
  timer.value.classList.add("shake")
}

function handleWarning() {
  if (!wrapper.value) return
  wrapper.value.classList.toggle("red", state.counter < props.warningBoundry)
}

let timeout: ReturnType<typeof setTimeout> | undefined
function tickTack() {
  clearTimeout(timeout)

  if (state.counter === 0) return

  handleWarning()

  if (
    state.counter < props.shakeBoundry &&
    !(state.counter % props.shakeInterval)
  )
    runShakeAnimation()

  state.counter--

  timeout = setTimeout(tickTack, INTERVAL)
}

tickTack()
onUnmounted(() => clearTimeout(timeout))

watch(
  () => props.from,
  newVal => {
    state.counter = newVal
    tickTack()
  }
)

watch(
  () => props.warningBoundry,
  () => handleWarning()
)

const handRotation = computed(() => {
  return (props.from - state.counter) * 90
})
</script>
<template>
  <div class="wrapper" ref="wrapper">
    <div class="timer" ref="timer">
      <div
        :style="{ '--hand-rotation': handRotation }"
        class="timer__hand"
      ></div>
      <svg viewBox="0 0 24 24">
        <path
          d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,1H9V3H15V1Z"
        ></path>
      </svg>
    </div>
    <div class="countdown">{{ state.counter }}</div>
  </div>
</template>
<style scoped lang="scss">
@use "sass:math" as math;

.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;

  &.red {
    color: #f22951;
    transition: color 2s linear;
  }
}

.countdown {
  min-width: 3ch;
  text-align: center;
  font-family: monospace;
  font-size: clamp(12px, 3vw, 19px);
  line-height: 1.1;
}

@keyframes shake {
  10%,
  90% {
    rotate: -2deg;
  }

  20%,
  80% {
    rotate: 4deg;
  }

  30%,
  50%,
  70% {
    rotate: -8deg;
  }

  40%,
  60% {
    rotate: 8deg;
  }
}

@keyframes grow {
  from {
    scale: 1;
  }

  30% {
    scale: 1.05;
  }

  to {
    scale: 1;
  }
}

.timer {
  --size: 31px;
  --rotation: 0;
  --scale: 1;

  position: relative;
  width: var(--size);
  height: var(--size);

  @media (max-width: 600px) {
    --size: 20px;
  }

  &.shake {
    animation: shake 820ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both,
      grow 0.7s ease-in-out;
  }

  svg {
    fill: currentColor;
    width: var(--size);
    height: var(--size);
  }

  &__hand {
    --w: calc(var(--size) / 10);
    --len: calc(var(--size) / 4);

    position: absolute;
    left: calc((var(--size) / 2) - (var(--w) / 2));
    top: calc(
      (var(--size) / 2) - (var(--size) * 0.02) - (var(--len) - var(--w))
    );
    width: var(--w);
    height: var(--len);
    background-color: currentColor;
    transform-origin: center calc(var(--len) - (var(--w) / 2));
    transform: rotate(calc(var(--hand-rotation, 0) * 1deg));
    transition: transform 1000ms;
  }
}
</style>
