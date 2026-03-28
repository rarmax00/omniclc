import { AppError } from "../utils/errors.js";
import { UNIT_FACTORS, TEMP_UNITS } from "../constants/units.js";

export function convertTemperature(value, from, to) {
  if (from === to) return value;

  if (!TEMP_UNITS.includes(from) || !TEMP_UNITS.includes(to)) {
    throw new AppError("Unsupported temperature unit", 400);
  }

  let celsius = value;

  if (from === "F") celsius = (value - 32) * (5 / 9);
  if (from === "K") celsius = value - 273.15;

  if (to === "C") return celsius;
  if (to === "F") return celsius * (9 / 5) + 32;
  if (to === "K") return celsius + 273.15;

  throw new AppError("Unsupported temperature unit", 400);
}

export function convertUnits({ tab, from, to, amount }) {
  if (!Number.isFinite(amount)) {
    throw new AppError("Invalid amount", 400);
  }

  if (tab === "temp") {
    return convertTemperature(amount, from, to);
  }

  const unitMap = UNIT_FACTORS[tab];
  if (!unitMap) {
    throw new AppError("Invalid unit category", 400);
  }

  if (!(from in unitMap) || !(to in unitMap)) {
    throw new AppError("Invalid unit code", 400);
  }

  const baseValue = amount * unitMap[from];
  const result = baseValue / unitMap[to];

  return result;
}