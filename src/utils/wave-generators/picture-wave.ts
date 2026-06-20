import sharp from 'sharp';
import { TypedArray } from '../../types';
import { BaseGenerator } from './base';
import { WaveTableProps } from './types';
import { convertTypedArray } from '..';

export class PictureWaveGenerator extends BaseGenerator {
  constructor(props: WaveTableProps) {
    super(props);
  }

  public override async evaluate({ image }) {
    this.buffer = await sharp(image)
      .greyscale()
      .flip()
      .resize(this.frameSize, this.frames, {
        fit: 'fill',
      })
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data }) => {
        const pixelsData = [...data].map((byte) => (byte / 2 ** 8) * 2 - 1);
        return convertTypedArray(
          new this.InputTypeConstructor(pixelsData),
          this.OutputTypeConstructor
        );
      })

    return this;
  }
}
