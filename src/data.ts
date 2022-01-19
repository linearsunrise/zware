import { Environment, MathExpression } from './environment';
import { convertTypedArray, TypedArray } from './utils';

export function dataRender(functionName: MathExpression): TypedArray {
  const frameSize = 2048;
  const frames = 256;
  const soundData: number[] = [];

  for (let i = 0; i < frames; i++) {
    for (let j = 0; j < frameSize; j++) {
      soundData.push(
        Environment.evaluate(
          {
            yOffset: i,
            xOffset: j,
            waveSize: frameSize,
            wavesCount: frames,
          },
          functionName
        )
      );
    }
  }

  const view = convertTypedArray(new Float32Array(soundData), Uint32Array);
  return view;
}
