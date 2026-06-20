export interface WavetableState {
  frames: Float32Array[] | null
  selectedFrameIndex: number
  formula: string
  isGenerating: boolean
  error: string | null
}
