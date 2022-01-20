import { convertTypedArray, TypedArray, TypedArrayConstructor } from './utils';

export type MathExpression = (x: number, y: number) => number;
type WaveTableProps = {
  waveSize: number;
  wavesCount: number;
  type: {
    input: TypedArrayConstructor;
    output: TypedArrayConstructor;
  };
};

interface BaseGeneratorState {
  frames: number;
  frameSamples: number;
  nonTypedArray: number[][];
  OutputArrayConstructor: TypedArrayConstructor;
  InputArrayConstructor: TypedArrayConstructor;
}

interface BaseGeneratorMethods {
  clip(v: number): number;
  evaluate(functionName: MathExpression): TypedArray;
}

const clip = function (value = 0) {
  if (!Number.isFinite(value)) return 0;
  if (value < -1) return -1;
  if (value > 1) return 1;
  return value;
};

export class BasicWaveGenerator implements BaseGeneratorMethods, BaseGeneratorState {
  nonTypedArray: number[][];
  InputArrayConstructor: TypedArrayConstructor;
  OutputArrayConstructor: TypedArrayConstructor;
  frames: number;
  frameSamples: number;

  constructor(props: WaveTableProps) {
    const { waveSize, wavesCount } = props;
    const { input: InputType, output: OutputType } = props.type;

    this.InputArrayConstructor = InputType;
    this.OutputArrayConstructor = OutputType;

    this.frames = wavesCount;
    this.frameSamples = waveSize;
    this.nonTypedArray = Array.from(
      { length: wavesCount }, 
      () => Array.from(
        { length: waveSize }, 
        (x, i) => (i / (waveSize - 1)) * 2 - 1
      )
    );
  }

  evaluate(functionName: MathExpression) {
    const source = this.nonTypedArray.flatMap((frame, frameIndex) => {
      const y = (frameIndex / (this.frames - 1)) * 2 - 1;

      return frame.map((sample) => {
        const x = sample;
        return this.clip(functionName(x, y));
      });
    });
    console.log(source);
    const typedArray = new this.InputArrayConstructor(source);

    return convertTypedArray(typedArray, this.OutputArrayConstructor);
  }

  clip = clip;
}

export class SpectralWaveGenerator
implements BaseGeneratorState, BaseGeneratorMethods
{
  nonTypedArray: number[][];
  OutputArrayConstructor: TypedArrayConstructor;
  InputArrayConstructor: TypedArrayConstructor;

  constructor(props: WaveTableProps) {
    throw new Error('Method not implemented.');
  }
  frames: number;
  frameSamples: number;
  evaluate(functionName: MathExpression): TypedArray {
    throw new Error('Method not implemented.');
  }
  clip = clip;
}
