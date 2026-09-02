import { parseFormula } from '@/shared/lib/math-parser';
import type { GenerateRequest, GenerateResponse } from './types';

self.onmessage = (event: MessageEvent<GenerateRequest>): void => {
  function clip(value: number): number {
    if (!isFinite(value)) return 0;
    return Math.max(-1, Math.min(1, value));
  }

  try {
    const { formula, frameCount, frameSize } = event.data;

    const fn = parseFormula(formula);

    const result = new Float32Array(frameCount * frameSize);

    for (let fi = 0; fi < frameCount; fi++) {
      const y = frameCount === 1 ? 0 : (fi / frameCount) * 2 - 1;

      const offset = fi * frameSize;

      for (let si = 0; si < frameSize; si++) {
        const x = frameSize === 1 ? 0 : (si / frameSize) * 2 - 1;

        result[offset + si] = clip(fn(x, y));
      }
    }

    const response: GenerateResponse = {
      type: 'result',
      buffer: result.buffer,
    };

    self.postMessage(response, { transfer: [result.buffer] })
  } catch (e) {
    const response: GenerateResponse = {
      type: 'error',
      message: e instanceof Error ? e.message : String(e),
    };

    self.postMessage(response);
  }
};
