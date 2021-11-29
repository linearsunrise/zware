exports.environmentFunction = function (
  props = {},
  functionName = () => 0
) {
  this.sin = Math.sin; this.cos = Math.cos; this.asin = Math.asin;
  this.acos = Math.acos; this.sinh = Math.sinh; this.cosh = Math.cosh;
  this.pi = Math.PI;
  this.cl = Math.ceil; this.fl = Math.floor;

  this.clip = function (value = 0) {
    if (value < -1) return -1;
    if (value > 1) return 1;
    return value;
  };

  // this.serial = function (ampFunction, phaseFunction, bandsCount = 0) {
  //   this.i = 0;
  //   let outputValue = 0;

  //   for (let i = 0; i < bandsCount; i++) {
  //     this.i = i;
  //     outputValue += Math.sin(Math.PI * i * this.x + 12 * this.uY * Math.sin( Math.PI * this.x)) / (ampFunction(i) || 1) * (-this.uY / 3 + 2/3);
  //   }

  //   return outputValue / 2;
  // }

  this.serial = function (ampFunction, bandsCount = 0) {
    let outputValue = 0;
    for (let i = 1; i <= bandsCount; i++) {
      const part = ampFunction(i);
      outputValue += Math.sin(Math.PI * i * this.x) 
        * (+Number.isFinite(+part) && +part)
    }

    return outputValue / 2;
  }

  const { yOffset: y_os, xOffset: x_os, waveSize: ws, wavesCount: wc } = props;
  [this.x, this.y, this.uX, this.uY, this.q] = [
    (x_os * 2 - ws) / ws,
    (y_os * 2 - wc) / wc,
    x_os / ws,
    y_os / wc,
    x_os
  ];

  return this.clip(
    functionName()
  );
}