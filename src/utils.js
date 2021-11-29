exports.float32ToInt32 = function (num) {
  const view = new Float32Array(1);
  view[0] = num

  return new Int32Array(view.buffer);
}