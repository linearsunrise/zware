import { TypedArray, TypedArrayConstructor } from "../types";

export function convertTypedArray(
  src: TypedArray,
  Type: TypedArrayConstructor
): TypedArray {
  return new Type(src.buffer);
}
