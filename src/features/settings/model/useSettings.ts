import { ref, computed } from 'vue'
import {
  DEFAULT_FRAME_COUNT,
  DEFAULT_FRAME_SIZE,
  FRAME_SIZE_PRESETS,
  type FrameSizePreset,
} from '@/shared/config/wavetable'

const frameSizeMode = ref<'preset' | 'custom'>('preset')
const frameSizePreset = ref<FrameSizePreset>(DEFAULT_FRAME_SIZE)
const customFrameSizeRaw = ref<number>(DEFAULT_FRAME_SIZE)
const frameCount = ref(DEFAULT_FRAME_COUNT)

const frameSize = computed(() =>
  frameSizeMode.value === 'custom' ? customFrameSizeRaw.value : frameSizePreset.value,
)

export function useSettings() {
  function setFrameSizePreset(value: FrameSizePreset | 'custom') {
    if (value === 'custom') {
      frameSizeMode.value = 'custom'
    } else {
      frameSizeMode.value = 'preset'
      frameSizePreset.value = value
    }
  }

  function setCustomFrameSize(value: number) {
    const clamped = Math.max(64, Math.min(8192, value))
    customFrameSizeRaw.value = clamped
  }

  return {
    frameSizeMode,
    frameSizePreset,
    customFrameSizeRaw,
    frameCount,
    frameSize,
    FRAME_SIZE_PRESETS,
    setFrameSizePreset,
    setCustomFrameSize,
  }
}
