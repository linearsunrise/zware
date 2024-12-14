import { convertTypedArray } from '..';
import { BaseGenerator } from './base';
import { WaveTableProps } from './types';

export class BasicWaveGenerator extends BaseGenerator {
  constructor(props: WaveTableProps) {
    super(props);
  }

  public override async evaluate({ func }) {
    const source = this.nonTypedArray.flatMap((frame, frameIndex) => {
      const y = (frameIndex / (this.frames - 1)) * 2 - 1;

      return frame.map((sample) => {
        const x = sample;
        return this.clip(func?.(x, y) ?? 0);
      });
    });

    this.buffer = convertTypedArray(
      new this.InputTypeConstructor(source),
      this.OutputTypeConstructor
    );

    return this;
  }
}
