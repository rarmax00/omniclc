import { AppError } from "../utils/errors.js";

const ALLOWED_TYPES = ["bin", "oct", "dec", "hex"];

export function validateBasesBody(body) {
  const type = String(body?.type || "").trim().toLowerCase();
  const value = String(body?.value || "").trim();

  if (!ALLOWED_TYPES.includes(type)) {
    throw new AppError("type must be one of: bin, oct, dec, hex", 400);
  }

  if (!value) {
    throw new AppError("value is required", 400);
  }

  return {
    type,
    value,
  };
}