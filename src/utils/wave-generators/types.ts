import type { TypedArrayConstructor } from '../../types';

export type MathExpression = (x: number, y: number) => number;
export type WaveTableProps = {
  waveSize: number;
  wavesCount: number;
  type: {
    input: TypedArrayConstructor;
    output: TypedArrayConstructor;
  };
};
