<template>
  <div class="heatmap">
    <span class="heatmap__label">Heatmap</span>
    <canvas ref="canvasRef" class="heatmap__canvas" />
    <div
      v-if="frames"
      class="heatmap__cursor"
      :style="{ left: cursorLeft }"
    />
    <div v-if="!frames" class="heatmap__empty">
      <span>Preview a formula to see the wavetable</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  frames: Float32Array[] | null
  selectedFrameIndex: number
}>()

const cursorLeft = computed(() => {
  if (!props.frames || props.frames.length <= 1) return '0%'
  return `${(props.selectedFrameIndex / (props.frames.length - 1)) * 100}%`
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !props.frames || props.frames.length === 0) return

  const frameCount = props.frames.length
  const frameSize = props.frames[0].length

  canvas.width = frameCount
  canvas.height = frameSize

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.createImageData(frameCount, frameSize)
  const data = imageData.data

  for (let fi = 0; fi < frameCount; fi++) {
    const frame = props.frames[fi]
    for (let si = 0; si < frameSize; si++) {
      const amp = frame[si]
      const t = (amp + 1) / 2
      const brightness = Math.round(18 + (227 - 18) * t)
      const y = frameSize - 1 - si
      const idx = (y * frameCount + fi) * 4
      data[idx] = brightness
      data[idx + 1] = brightness
      data[idx + 2] = brightness
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

watch(() => props.frames, draw)

onMounted(() => {
  resizeObserver = new ResizeObserver(draw)
  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement)
  }
  draw()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.heatmap {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.heatmap__label {
  position: absolute;
  top: 4rem;
  left: 4rem;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 1;
}

.heatmap__canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  display: block;
}

.heatmap__cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0.25rem;
  background: #4ade80;
  box-shadow: 0 0 4rem #4ade80;
  pointer-events: none;
  transform: translateX(-50%);
  z-index: 2;
  transition: left 0.05s linear;
}

.heatmap__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.25);
}
</style>
