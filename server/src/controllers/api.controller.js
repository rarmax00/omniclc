import { calculateExpression } from "../services/calc.service.js";
import { convertNaturalLanguageToExpression } from "../services/ai-calc.service.js";
import {
  getCurrenciesList,
  getRatesByBase,
  convertCurrency,
  convertCurrencyBatch,
} from "../services/currency.service.js";
import { convertUnits } from "../services/units.service.js";
import { convertBases } from "../services/bases.service.js";
import {
  getHistory,
  addHistoryItem,
  clearHistory,
} from "../services/history.service.js";

export async function ping(req, res) {
  res.json({
    ok: true,
    msg: "pong",
    file: "server/src/controllers/api.controller.js",
    time: new Date().toISOString(),
  });
}

export async function getCurrencies(req, res) {
  const data = await getCurrenciesList();
  res.json(data);
}

export async function getRates(req, res) {
  const { base } = req.validatedQuery;
  const data = await getRatesByBase(base);
  res.json(data);
}

export async function postCurrencyConvert(req, res) {
  const data = await convertCurrency(req.validatedBody);

  await addHistoryItem({
    type: "currency",
    input: `${req.validatedBody.amount} ${req.validatedBody.from} to ${req.validatedBody.to}`,
    output: String(data.result),
    payload: {
      ...req.validatedBody,
      ...data,
    },
    ts: new Date().toISOString(),
  });

  res.json({
    ok: true,
    ...data,
  });
}

export async function postCurrencyBatch(req, res) {
  const data = await convertCurrencyBatch(req.validatedBody);
  res.json({
    ok: true,
    ...data,
  });
}

export async function postUnitsConvert(req, res) {
  const result = convertUnits(req.validatedBody);

  await addHistoryItem({
    type: "units",
    input: `${req.validatedBody.amount} ${req.validatedBody.from} to ${req.validatedBody.to}`,
    output: String(result),
    payload: {
      ...req.validatedBody,
      result,
    },
    ts: new Date().toISOString(),
  });

  res.json({
    ok: true,
    result,
  });
}

export async function postBasesConvert(req, res) {
  const data = convertBases(req.validatedBody.type, req.validatedBody.value);

  await addHistoryItem({
    type: "bases",
    input: `${req.validatedBody.value} ${req.validatedBody.type}`,
    output: JSON.stringify(data),
    payload: {
      ...req.validatedBody,
      ...data,
    },
    ts: new Date().toISOString(),
  });

  res.json({
    ok: true,
    ...data,
  });
}

export async function postCalc(req, res) {
  const { expr } = req.validatedBody;

  let result;
  let parsedExpression = expr;
  let usedAi = false;

  try {
    result = calculateExpression(expr);
  } catch {
    parsedExpression = await convertNaturalLanguageToExpression(expr);
    result = calculateExpression(parsedExpression);
    usedAi = true;
  }

  await addHistoryItem({
    type: "calc",
    input: expr,
    output: String(result),
    payload: {
      expr,
      parsedExpression,
      usedAi,
    },
    ts: new Date().toISOString(),
  });

  res.json({
    ok: true,
    result,
    parsedExpression,
    usedAi,
  });
}

export async function getHistoryList(req, res) {
  const { limit } = req.validatedQuery;

  res.json({
    ok: true,
    items: await getHistory(limit),
  });
}

export async function postHistoryItem(req, res) {
  const { type, input, output, payload } = req.validatedBody;

  await addHistoryItem({
    type,
    input,
    output,
    payload,
    ts: new Date().toISOString(),
  });

  res.json({
    ok: true,
  });
}

export async function deleteHistoryList(req, res) {
  await clearHistory();

  res.json({
    ok: true,
  });
}