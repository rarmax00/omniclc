import { AppError } from "../utils/errors.js";

export function validateCalcBody(body) {
  const expr = String(body?.expr || "").trim();

  if (!expr) {
    throw new AppError("expr is required", 400);
  }

  return {
    expr,
  };
}