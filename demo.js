// Demo expressions
exports.circle = () => str(x ** 2) + str(y ** 2) === 1;
exports.fmFunction = () => sin(2 * x * pi + uY * 3 * sin(2 * x * pi));
exports.fmDuneFunction = () => sin(2 * x * pi + uY * 10 * sin(2 * x * pi + uY * pi));

exports.serl = () => serial((x) => 1 / x, 1024);
exports.serl2 = () => serial((x) => x <= 8 && 1 / x, 1024)

const str = (num) => +num.toString().substring(0, 4)