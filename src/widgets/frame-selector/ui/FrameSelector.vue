<template>
  <div class="frame-selector">
    <span class="frame-selector__label">Frames</span>
    <div class="frame-selector__grid" v-if="frames">
      <canvas
        v-for="(_, i) in frames"
        :key="i"
        :ref="(el) => setRef(el as HTMLCanvasElement | null, i)"
        class="frame-selector__frame"
        :class="{ 'frame-selector__frame--active': i === selectedIndex }"
        width="32"
        height="32"
        :title="`Frame ${i}`"
        @click="$emit('select', i)"
      />
    </div>
    <div v-else class="frame-selector__empty">
      <span>No frames yet</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onUpdated } from 'vue'

const props = defineProps<{
  frames: Float32Array[] | null
  selectedIndex: number
}>()

defineEmits<{
  select: [index: number]
}>()

const canvasRefs: (HTMLCanvasElement | null)[] = []

function setRef(el: HTMLCanvasElement | null, i: number) {
  canvasRefs[i] = el
}

function drawFrame(canvas: HTMLCanvasElement, frame: Float32Array) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 32, 32)

  ctx.strokeStyle = '#e3e3e3'
  ctx.lineWidth = 0.75
  ctx.beginPath()

  for (let px = 0; px < 32; px++) {
    const si = Math.floor((px / 32) * frame.length)
    const y = (1 - (frame[si] + 1) / 2) * 32
    if (px === 0) ctx.moveTo(px, y)
    else ctx.lineTo(px, y)
  }

  ctx.stroke()
}

function drawAll() {
  if (!props.frames) return
  for (let i = 0; i < props.frames.length; i++) {
    const canvas = canvasRefs[i]
    if (canvas) drawFrame(canvas, props.frames[i])
  }
}

watch(() => props.frames, drawAll)
onUpdated(drawAll)
</script>

<style scoped>
.frame-selector {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  gap: 3rem;
  padding: 3rem;
  box-sizing: border-box;
}

.frame-selector__label {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
  flex-shrink: 0;
}

.frame-selector__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
  align-content: flex-start;
}

.frame-selector__frame {
  width: 8rem;
  height: 8rem;
  cursor: pointer;
  border: 0.25rem solid transparent;
  box-sizing: border-box;
  flex-shrink: 0;
  image-rendering: pixelated;
}

.frame-selector__frame--active {
  border-color: #e3e3e3;
}

.frame-selector__frame:hover:not(.frame-selector__frame--active) {
  border-color: rgba(227, 227, 227, 0.3);
}

.frame-selector__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.25);
}
</style>
