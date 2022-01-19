export type MathExpression = (x: number, y?: number) => number;
type WaveProps = {
  yOffset: number;
  xOffset: number;
  waveSize: number;
  wavesCount: number;
};
type XYExpr = (x: number, y: number) => number;

export class Environment {

  // serial(ampFunction: (x: number) => number, bandsCount = 0) {
  //   let outputValue = 0;
  //   for (let i = 1; i <= bandsCount; i++) {
  //     const part = ampFunction(i);
  //     outputValue +=
  //       Math.sin(Math.PI * i * this.x) * (+Number.isFinite(+part) && +part);
  //   }

  //   return outputValue;
  // }

  static clip(value = 0) {
    if (Number.isFinite(value)) {
      if (value < -1) return -1;
      if (value > 1) return 1;
      return value;
    }
    return 0;
  }

  static evaluate(props: WaveProps, functionName: MathExpression) {
    const {
      yOffset: y_os,
      xOffset: x_os,
      waveSize: ws,
      wavesCount: wc,
    } = props;
    const [x, y] = [
      (x_os * 2 - ws) / ws,
      (y_os * 2 - wc) / wc,
    ];
    return this.clip(functionName(x, y));
  }
}
