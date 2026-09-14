export type MainToWorkletMessage =
  | {
      type: 'wavetable'
      buffer: ArrayBuffer
      frameSize: number
      frameCount: number
    }
  | {
      type: 'frameIndex'
      index: number
    }
  | {
      type: 'noteOn'
      frequency: number
      velocity: number
    }
  | {
      type: 'noteOff'
    }
