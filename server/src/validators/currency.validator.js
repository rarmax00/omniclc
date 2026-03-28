import { AppError } from "../utils/errors.js";

function normalizeCode(value, fieldName) {
  const code = String(value || "").trim().toUpperCase();

  if (!code) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  if (!/^[A-Z]{3}$/.test(code)) {
    throw new AppError(`${fieldName} must be a 3-letter currency code`, 400);
  }

  return code;
}

export function validateCurrencyConvertBody(body) {
  const amount = Number(body?.amount);
  const from = normalizeCode(body?.from, "from");
  const to = normalizeCode(body?.to, "to");

  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError("amount must be a valid non-negative number", 400);
  }

  return {
    amount,
    from,
    to,
  };
}

export function validateCurrencyBatchBody(body) {
  const amount = Number(body?.amount);
  const from = normalizeCode(body?.from, "from");

  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError("amount must be a valid non-negative number", 400);
  }

  if (!Array.isArray(body?.tos) || !body.tos.length) {
    throw new AppError("tos must be a non-empty array", 400);
  }

  const tos = body.tos.map((item) => normalizeCode(item, "tos item"));

  return {
    amount,
    from,
    tos,
  };
}

export function validateRatesQuery(query) {
  const base = String(query?.base || "USD").trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(base)) {
    throw new AppError("base must be a 3-letter currency code", 400);
  }

  return {
    base,
  };
}