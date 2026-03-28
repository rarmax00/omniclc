import { AppError } from "../utils/errors.js";
import { UNIT_TABS } from "../constants/units.js";

export function validateUnitsBody(body) {
  const tab = String(body?.tab || "").trim();
  const from = String(body?.from || "").trim();
  const to = String(body?.to || "").trim();
  const amount = Number(body?.amount);

  if (!UNIT_TABS.includes(tab)) {
    throw new AppError("Invalid tab", 400);
  }

  if (!from || !to) {
    throw new AppError("from and to are required", 400);
  }

  if (!Number.isFinite(amount)) {
    throw new AppError("amount must be a valid number", 400);
  }

  return {
    tab,
    from,
    to,
    amount,
  };
}