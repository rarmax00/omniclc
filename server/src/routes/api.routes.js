import { Router } from "express";
import { asyncHandler } from "../utils/errors.js";
import { validateBody, validateQuery } from "../middleware/validate.js";

import {
  ping,
  getCurrencies,
  getRates,
  postCurrencyConvert,
  postCurrencyBatch,
  postUnitsConvert,
  postBasesConvert,
  postCalc,
  getHistoryList,
  postHistoryItem,
  deleteHistoryList,
} from "../controllers/api.controller.js";

import {
  validateCurrencyConvertBody,
  validateCurrencyBatchBody,
  validateRatesQuery,
} from "../validators/currency.validator.js";
import { validateUnitsBody } from "../validators/units.validator.js";
import { validateBasesBody } from "../validators/bases.validator.js";
import { validateCalcBody } from "../validators/calc.validator.js";
import {
  validateHistoryQuery,
  validateHistoryBody,
} from "../validators/history.validator.js";

const router = Router();

router.get("/ping", asyncHandler(ping));

router.get("/currencies", asyncHandler(getCurrencies));
router.get("/rates", validateQuery(validateRatesQuery), asyncHandler(getRates));

router.post(
  "/convert/currency",
  validateBody(validateCurrencyConvertBody),
  asyncHandler(postCurrencyConvert)
);

router.post(
  "/convert/currency/batch",
  validateBody(validateCurrencyBatchBody),
  asyncHandler(postCurrencyBatch)
);

router.post(
  "/convert/units",
  validateBody(validateUnitsBody),
  asyncHandler(postUnitsConvert)
);

router.post(
  "/convert/bases",
  validateBody(validateBasesBody),
  asyncHandler(postBasesConvert)
);

router.post(
  "/calc",
  validateBody(validateCalcBody),
  asyncHandler(postCalc)
);

router.get(
  "/history",
  validateQuery(validateHistoryQuery),
  asyncHandler(getHistoryList)
);

router.post(
  "/history",
  validateBody(validateHistoryBody),
  asyncHandler(postHistoryItem)
);

router.delete("/history", asyncHandler(deleteHistoryList));

export default router;