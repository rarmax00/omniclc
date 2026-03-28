import { AppError } from "../utils/errors.js";

export function convertBases(type, valueRaw) {
  const value = String(valueRaw || "").trim();

  if (!value) {
    throw new AppError("Empty value", 400);
  }

  let numberValue;

  if (type === "bin") {
    if (!/^[01]+$/.test(value)) throw new AppError("BIN allows only 0 and 1", 400);
    numberValue = parseInt(value, 2);
  } else if (type === "oct") {
    if (!/^[0-7]+$/.test(value)) throw new AppError("OCT allows only 0-7", 400);
    numberValue = parseInt(value, 8);
  } else if (type === "dec") {
    if (!/^[0-9]+$/.test(value)) throw new AppError("DEC allows only digits", 400);
    numberValue = parseInt(value, 10);
  } else if (type === "hex") {
    if (!/^[0-9a-fA-F]+$/.test(value)) throw new AppError("HEX allows only 0-9 and A-F", 400);
    numberValue = parseInt(value, 16);
  } else {
    throw new AppError("Invalid base type", 400);
  }

  if (!Number.isFinite(numberValue)) {
    throw new AppError("Invalid numeric value", 400);
  }

  return {
    bin: numberValue.toString(2),
    oct: numberValue.toString(8),
    dec: numberValue.toString(10),
    hex: numberValue.toString(16).toUpperCase(),
  };
}