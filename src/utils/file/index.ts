import { writeFileSync } from "fs";
import { join } from "path";
import { TypedArray } from "../../types";

export class FileHandlingService {
  public static saveTo (toPath: string, buffer: TypedArray) {
    writeFileSync(
      join(__dirname, toPath),
      buffer
    );
  }
}