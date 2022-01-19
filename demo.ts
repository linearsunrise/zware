// Demo expressions
// export const Serials = {
//   serl() { return serial((x) => 1 / x, 1024); },
//   serl2() { return serial((x) => x % 2 && 1 / x, 1024); }
// };

import { MathExpression } from './src/environment';

const unsign = (x: number): number => (x + 1) / 2;

export const BasicExpressions = {
  fmFunction: (x: number, y: number) =>
    Math.sin(2 * x * Math.PI + unsign(y) * 3 * Math.sin(2 * x * Math.PI)),
  fmDuneFunction: (x: number, y: number) =>
    Math.sin(
      2 * x * Math.PI +
        unsign(y) * 10 * Math.sin(2 * x * Math.PI + unsign(y) * Math.PI)
    ),
};

export const Logic = {
  circle: (
    x: number,
    y: number,
    xBias: number,
    yBias: number,
    radius: number
  ): boolean => (x + xBias) ** 2 + (y + yBias) ** 2 >= radius ** 2,

  rect: (
    x: number,
    y: number,
    xPos?: number,
    yPos?: number,
    width?: number,
    height?: number
  ): boolean =>
    x >= (Number.isFinite(xPos) ? xPos : -1) &&
    x <= (Number.isFinite(width) ? width : 1) &&
    y >= (Number.isFinite(yPos) ? yPos : -1) &&
    y <= (Number.isFinite(height) ? height : 1),
};

export const Letters: { [k: string]: MathExpression } = {
  letterB(x: number, y: number): number {
    const circle = Logic.circle;
    const rect = Logic.rect;
    const a = 2 / 5;
    const b = 1 / 5;
    const c = 3 / 5;

    return +(
      (
        circle(x, y, -a + 0.05, -a + 0.05, c - 0.1) &&
        !rect(x, y, -1 + 0.15, -1 + 0.15, b + 0.15, b - 0.05) &&
        circle(x, y, -b + 0.05, -c + 0.05, a - 0.1) &&
        !rect(x, y, -1 + 0.15, 1 - 0.15, b - 0.05, a - 0.15) &&
        circle(x, y, -a, a, c)
      )
      //   ||
      //   circle(x, y, -b, -c, a) ||
      //   ((x < b || y < b) && x < a)) &&
      // rect(x, y)
    );
  },
  letterS(x: number, y: number): number {
    const a = 0.15 / 4;

    return Number(
      (Logic.circle(x, y, -0.5 + a, 0.5 - a, 0.5 + a) ||
        (Logic.circle(x, y, 0.5 - a, -0.5 + a, 0.5 + a) &&
          !Logic.rect(x, y, null, -0.85, 0.5 - a, -a * 2) &&
          (x < -0.5 + a || y > 0.85 || y < a * 2)) ||
        (x > -0.5 + a && y > 0.85) ||
        (x < 0.5 - a && y < -0.85) ||
        (x > -0.5 + a && x < 0.5 - a && y > -a * 2 && y < a * 2)) &&
        Logic.circle(x, y, -0.5 + a, 0.5 - a, 0.5 - 3 * a) &&
        Logic.circle(x, y, 0.5 - a, -0.5 + a, 0.5 - 3 * a)
    );
  },
};
