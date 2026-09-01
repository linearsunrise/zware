export type GenerateRequest = {
  type: 'generate'
  formula: string
  frameCount: number
  frameSize: number
}

export type GenerateResponse =
  | {
      type: 'result'
      buffer: ArrayBufferLike
    }
  | {
      type: 'error'
      message: string
    }