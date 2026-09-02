import { ref, shallowRef } from 'vue';
import { useSettings } from '@/features/settings/model/useSettings';
import { GenerateResponse, GenerateRequest } from './types';

const framesBuffer = shallowRef<Float32Array | null>(null);
const selectedFrameIndex = ref(0);
const formula = ref('sin(x * PI)');
const isGenerating = ref(false);
const error = ref<string | null>(null);

const worker = new Worker(new URL('./wavetable.worker.ts', import.meta.url), {
  type: 'module',
});

export function generateWavetable(
  request: GenerateRequest
): Promise<Float32Array<ArrayBufferLike>> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<GenerateResponse>) => {
      const response = event.data;

      if (response.type === 'error') {
        reject(new Error(response.message));
        return;
      }

      resolve(new Float32Array(response.buffer));
    };

    worker.postMessage(request);
  });
}

export function useWavetable() {
  const { frameSize, frameCount } = useSettings();

  async function preview(formulaText: string) {
    isGenerating.value = true;
    error.value = null;
    formula.value = formulaText;

    try {
      framesBuffer.value = await generateWavetable({
        type: 'generate',
        formula: formulaText,
        frameCount: frameCount.value,
        frameSize: frameSize.value,
      })

      selectedFrameIndex.value = Math.min(
        selectedFrameIndex.value,
        frameCount.value - 1
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      framesBuffer.value = null;
    } finally {
      isGenerating.value = false;
    }
  }

  function selectFrame(index: number) {
    selectedFrameIndex.value = index;
  }

  return {
    framesBuffer,
    selectedFrameIndex,
    formula,
    isGenerating,
    error,
    frameSize,
    frameCount,
    preview,
    selectFrame,
  };
}
