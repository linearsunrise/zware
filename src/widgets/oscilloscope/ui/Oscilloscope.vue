<template>
  <div class="oscilloscope">
    <span class="oscilloscope__label">Frame {{ frameIndex }}</span>
    <canvas ref="canvasRef" class="oscilloscope__canvas" />
    <div v-if="!frame" class="oscilloscope__empty">
      <span>Select a frame to see the waveform</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  frame: Float32Array | null
  frameIndex: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = width || 400
  canvas.height = height || 200

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#121212'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(227, 227, 227, 0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, canvas.height / 2)
  ctx.lineTo(canvas.width, canvas.height / 2)
  ctx.stroke()

  if (!props.frame) return

  ctx.strokeStyle = '#e3e3e3'
  ctx.lineWidth = 1.5
  ctx.beginPath()

  const frame = props.frame
  const w = canvas.width
  const h = canvas.height

  for (let px = 0; px < w; px++) {
    const si = Math.floor((px / w) * frame.length)
    const x = px
    const y = (1 - (frame[si] + 1) / 2) * h
    if (px === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.stroke()
}

watch(() => [props.frame, props.frameIndex], draw)

onMounted(() => {
  resizeObserver = new ResizeObserver(draw)
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  draw()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.oscilloscope {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.oscilloscope__label {
  position: absolute;
  top: 2rem;
  left: 3rem;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 1;
}

.oscilloscope__canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.oscilloscope__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.25);
}
</style>
