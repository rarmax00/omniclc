import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

const ALLOWED_TYPES = ["calc", "currency", "units", "bases"];

export function validateHistoryQuery(query) {
  const rawLimit = Number(query?.limit ?? env.historyDefaultLimit);

  if (!Number.isFinite(rawLimit) || rawLimit <= 0) {
    throw new AppError("limit must be a positive number", 400);
  }

  return {
    limit: Math.min(rawLimit, env.historyMaxLimit),
  };
}

export function validateHistoryBody(body) {
  const type = String(body?.type || "").trim();
  const input = String(body?.input || "").trim();
  const output = String(body?.output || "");
  const payload = body?.payload ?? null;

  if (!ALLOWED_TYPES.includes(type)) {
    throw new AppError("Invalid history type", 400);
  }

  if (!input) {
    throw new AppError("input is required", 400);
  }

  return {
    type,
    input,
    output,
    payload,
  };
}