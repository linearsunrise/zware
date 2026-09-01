<template>
  <div class="frame-selector">
    <span class="frame-selector__label">
      Frames
    </span>

    <div
      v-if="frames"
      ref="containerRef"
      class="frame-selector__viewport"
    >
      <canvas
        ref="canvasRef"
        class="frame-selector__canvas"
        @click="handleClick"
      />
    </div>

    <div v-else class="frame-selector__empty">
      No frames yet
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onBeforeUnmount, onMounted, onUpdated } from 'vue';

const props = defineProps<{
  frames: Float32Array<ArrayBufferLike> | null;
  frameSize: number;
  frameCount: number;
  selectedIndex: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const canvasRef = useTemplateRef('canvasRef')
const containerRef = useTemplateRef('containerRef')

const resizeObserver =
  new ResizeObserver(() => {
    draw()
  })

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: Float32Array,
  x: number,
  y: number,
  selected: boolean,
) {
  ctx.fillStyle = '#1a1a1a'

  ctx.fillRect(
    x,
    y,
    TILE_SIZE,
    TILE_SIZE,
  )

  if (selected) {
    ctx.strokeStyle = '#e3e3e3'
    ctx.lineWidth = 1

    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      TILE_SIZE - 1,
      TILE_SIZE - 1,
    )
  }

  ctx.strokeStyle = '#e3e3e3'
  ctx.lineWidth = 0.75

  ctx.beginPath()

  for (
    let px = 0;
    px < TILE_SIZE;
    px++
  ) {
    const si = Math.floor(
      (px / (TILE_SIZE - 1)) *
      (frame.length - 1)
    )

    const amplitude = frame[si]

    const py =
      y +
      (1 - (amplitude + 1) / 2) *
      TILE_SIZE

    if (px === 0) {
      ctx.moveTo(x + px, py)
    } else {
      ctx.lineTo(x + px, py)
    }
  }

  ctx.stroke()
}

const TILE_SIZE = 32
const GAP = 4

const getColumnCount = (canvasWidth: number) => {
  return Math.floor(canvasWidth / (TILE_SIZE + GAP));
}

function draw() {
  const canvas = canvasRef.value
  const container = containerRef.value

  if (!canvas || !container || !props.frames) {
    return
  }

  const width = container.clientWidth

  const columns = Math.max(
    1,
    Math.floor(
      (width + GAP) /
      (TILE_SIZE + GAP)
    )
  )

  const rows = Math.ceil(
    props.frameCount / columns
  )

  const height =
    rows * TILE_SIZE +
    Math.max(0, rows - 1) * GAP

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  for (
    let i = 0;
    i < props.frameCount;
    i++
  ) {
    const col = i % columns
    const row = Math.floor(i / columns)

    const x =
      col * (TILE_SIZE + GAP)

    const y =
      row * (TILE_SIZE + GAP)

    const offset =
      i * props.frameSize

    const frame =
      props.frames.subarray(
        offset,
        offset + props.frameSize,
      )

    drawFrame(
      ctx,
      frame,
      x,
      y,
      i === props.selectedIndex,
    )
  }
}

function handleClick(
  event: MouseEvent,
) {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect =
    canvas.getBoundingClientRect()

  const columnsCount =
    getColumnCount(canvas.width)

  const x =
    event.clientX - rect.left

  const y =
    event.clientY - rect.top

  const stride =
    TILE_SIZE + GAP

  const col =
    Math.floor(x / stride)

  const row =
    Math.floor(y / stride)

  const localX =
    x % stride

  const localY =
    y % stride

  // пользователь кликнул именно в gap
  if (
    localX >= TILE_SIZE ||
    localY >= TILE_SIZE
  ) {
    return
  }

  const index =
    row * columnsCount + col

  if (
    index >= 0 &&
    index < props.frameCount
  ) {
    emit('select', index)
  }
}

onUpdated(() => draw())

onMounted(() => {
  if (containerRef.value) {
    resizeObserver.observe(
      containerRef.value
    )
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>

<style scoped>
.frame-selector {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  gap: 4rem;
  padding: 4rem;
  box-sizing: border-box;
}

.frame-selector__viewport {
  overflow-y: auto;
  overflow-x: hidden;
}

.frame-selector__label {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
  flex-shrink: 0;
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
