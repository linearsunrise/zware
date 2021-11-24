
exports.environmentFunction = function (
  props = {},
  functionName = () => 0
) {
  this.sin = Math.sin; this.cos = Math.cos; this.asin = Math.asin;
  this.acos = Math.acos; this.sinh = Math.sinh; this.cosh = Math.cosh;
  this.pi = Math.PI;
  this.cl = Math.ceil; this.fl = Math.floor;

  this.clip = function (x = 0) {
    if (x < -1) return -1;
    if (x > 1) return 1;
    return x;
  }
  const digitalClip = this.clip;

  const { yOffset: y_os, xOffset: x_os, waveSize: ws, wavesCount: wc } = props;
  [this.x, this.y, this.uX, this.uY] = [
    (x_os * 2 - ws) / ws,
    (y_os * 2 - wc) / wc,
    x_os / ws,
    y_os / wc,
  ];

  const float32ToInt32 = function (num) {
    const view = new Float32Array(1);
    view[0] = num

    return new Int32Array(view.buffer)[0];
  }


  return float32ToInt32(digitalClip(
    functionName()
  ));
}

// Demo expressions
exports.circle = () => str(x ** 2) + str(y ** 2) === 1;
exports.fmFunction = () => sin(2 * x * pi + uY * 3 * sin(2 * x * pi));
exports.fmDuneFunction = () => sin(2 * x * pi + uY * 3 * sin(2 * x * pi + uY * 3));

const str = (num) => +num.toString().substring(0, 4)