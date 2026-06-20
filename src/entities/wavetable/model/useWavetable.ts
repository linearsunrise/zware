import { ref, shallowRef } from 'vue'
import { parseFormula } from '@/shared/lib/math-parser'
import { generateWavetable } from '@/entities/wavetable/lib/generator'
import { useSettings } from '@/features/settings/model/useSettings'

const frames = shallowRef<Float32Array[] | null>(null)
const selectedFrameIndex = ref(0)
const formula = ref('sin(x * PI)')
const isGenerating = ref(false)
const error = ref<string | null>(null)

export function useWavetable() {
  const { frameSize, frameCount } = useSettings()

  function preview(formulaText: string) {
    isGenerating.value = true
    error.value = null
    formula.value = formulaText

    try {
      const fn = parseFormula(formulaText)
      frames.value = generateWavetable(fn, frameCount.value, frameSize.value)
      selectedFrameIndex.value = Math.min(
        selectedFrameIndex.value,
        frameCount.value - 1,
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      frames.value = null
    } finally {
      isGenerating.value = false
    }
  }

  function selectFrame(index: number) {
    selectedFrameIndex.value = index
  }

  return {
    frames,
    selectedFrameIndex,
    formula,
    isGenerating,
    error,
    preview,
    selectFrame,
  }
}
