import { convertTypedArray } from "..";
import { TypedArray, TypedArrayConstructor } from "../../types";
import { MathExpression, WaveTableProps } from "./types";

type EvaluateArgsDict = {
  image?: string | TypedArray | Buffer;
  func?: MathExpression;
}

export class BaseGenerator {
  private props: WaveTableProps;
  protected nonTypedArray: number[][];
  protected buffer: TypedArray | null;

  constructor(props: WaveTableProps) {
    this.props = props;
    this.buffer = null;

    this.nonTypedArray = Array.from({ length: this.props.wavesCount }, () =>
      Array.from(
        { length: this.props.waveSize },
        (x, i) => (i / (this.props.waveSize - 1)) * 2 - 1
      )
    );
  }

  public clip(value = 0) {
    if (!Number.isFinite(value)) return 0;
    if (value < -1) return -1;
    if (value > 1) return 1;
    return value;
  }

  public async evaluate(props: EvaluateArgsDict): Promise<BaseGenerator> {
    const typedArray = new this.InputTypeConstructor([]);

    this.buffer = convertTypedArray(typedArray, this.OutputTypeConstructor);
    return this;
  }

  public getBuffer() {
    if (!this.buffer) throw new Error('Buffer is empty');
    return this.buffer;
  }

  get InputTypeConstructor(): TypedArrayConstructor {
    return this.props.type.input;
  }

  get OutputTypeConstructor(): TypedArrayConstructor {
    return this.props.type.output;
  }

  get frames(): number {
    return this.props.wavesCount;
  }

  get frameSize(): number {
    return this.props.waveSize;
  }
}