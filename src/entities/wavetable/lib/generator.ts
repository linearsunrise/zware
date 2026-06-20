import type { FormulaFn } from '@/shared/lib/math-parser'

function clip(value: number): number {
  if (!isFinite(value)) return 0
  return Math.max(-1, Math.min(1, value))
}

export function generateWavetable(
  fn: FormulaFn,
  frameCount: number,
  frameSize: number,
): Float32Array[] {
  const frames: Float32Array[] = []

  for (let fi = 0; fi < frameCount; fi++) {
    const y = frameCount === 1 ? 0 : (fi / (frameCount - 1)) * 2 - 1
    const frame = new Float32Array(frameSize)

    for (let si = 0; si < frameSize; si++) {
      const x = (si / (frameSize - 1)) * 2 - 1
      frame[si] = clip(fn(x, y))
    }

    frames.push(frame)
  }

  return frames
}
