export const FRAME_SIZE_PRESETS = [512, 1024, 2048] as const
export type FrameSizePreset = (typeof FRAME_SIZE_PRESETS)[number]

export const DEFAULT_FRAME_SIZE: FrameSizePreset = 2048
export const DEFAULT_FRAME_COUNT = 256
export const WAV_SAMPLE_RATE = 44100
