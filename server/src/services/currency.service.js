import { createTTLCache } from "../utils/cache.js";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

const cache = createTTLCache();

const FALLBACK_CURRENCIES = {
    USD: "US Dollar",
    EUR: "Euro",
    UAH: "Українська гривня",
    GBP: "British Pound",
    PLN: "Polish Zloty",
    CZK: "Czech Koruna",
    CHF: "Swiss Franc",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CNY: "Chinese Yuan",
  };

const FX_TTL_MS = env.fxTtlMs;
const NBU_TTL_MS = env.nbuTtlMs;
const CURRENCIES_TTL_MS = env.currenciesTtlMs;

async function fetchJson(url, errorMessage) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new AppError(errorMessage, 500);
  }

  return res.json();
}

async function fetchFrankfurter(path) {
  return fetchJson(`https://api.frankfurter.dev/v1/${path}`, "Frankfurter provider failed");
}

async function fetchNBU() {
  const cached = cache.get("nbu:rates");
  if (cached) return cached;

  const data = await fetchJson(
    "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json",
    "NBU provider failed"
  );

  if (!Array.isArray(data)) {
    throw new AppError("NBU returned invalid data", 500);
  }

  const rates = { UAH: 1 };
  let providerDate = null;

  for (const item of data) {
    const code = String(item.cc || "").toUpperCase();
    const rate = Number(item.rate);

    if (code && Number.isFinite(rate)) {
      rates[code] = rate;
    }

    if (!providerDate && item.exchangedate) {
      providerDate = String(item.exchangedate);
    }
  }

  const payload = { rates, providerDate };
  cache.set("nbu:rates", payload, NBU_TTL_MS);
  return payload;
}

async function getFrankfurterCodes() {
  const cached = cache.get("ff:codes");
  if (cached) return cached;

  const data = await fetchFrankfurter("currencies");
  const codes = Object.keys(data || {}).map((code) => String(code).toUpperCase());

  cache.set("ff:codes", codes, CURRENCIES_TTL_MS);
  return codes;
}

function convertViaUAH(amount, from, to, nbuRates) {
  if (!Number.isFinite(amount)) {
    throw new AppError("Invalid amount", 400);
  }

  if (!nbuRates[from]) {
    throw new AppError(`NBU has no rate for ${from}`, 400);
  }

  if (!nbuRates[to]) {
    throw new AppError(`NBU has no rate for ${to}`, 400);
  }

  const amountInUAH = from === "UAH" ? amount : amount * nbuRates[from];
  return to === "UAH" ? amountInUAH : amountInUAH / nbuRates[to];
}

export async function getCurrenciesList() {
    const cached = cache.get("currencies:list");
    if (cached) return cached;
  
    try {
      const frankfurterCurrencies = await fetchFrankfurter("currencies");
      const nbu = await fetchNBU();
  
      const merged = { ...(frankfurterCurrencies || {}) };
  
      if (!merged.UAH) {
        merged.UAH = "Українська гривня";
      }
  
      for (const code of Object.keys(nbu.rates || {})) {
        if (!merged[code]) {
          merged[code] = code;
        }
      }
  
      const payload = {
        source: "live",
        data: merged,
      };
  
      cache.set("currencies:list", payload, CURRENCIES_TTL_MS);
      return payload;
    } catch {
      const payload = {
        source: "fallback",
        data: FALLBACK_CURRENCIES,
      };
  
      cache.set("currencies:list", payload, CURRENCIES_TTL_MS);
      return payload;
    }
  }

export async function getRatesByBase(base) {
  const currencyBase = String(base || "USD").toUpperCase();
  const cacheKey = `rates:${currencyBase}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = await fetchFrankfurter(`latest?base=${encodeURIComponent(currencyBase)}`);

  const payload = {
    source: "live",
    base: currencyBase,
    data,
  };

  cache.set(cacheKey, payload, FX_TTL_MS);
  return payload;
}

export async function convertCurrency({ amount, from, to }) {
  const numericAmount = Number(amount);
  const fromCode = String(from || "").toUpperCase();
  const toCode = String(to || "").toUpperCase();

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new AppError("Invalid amount", 400);
  }

  if (!fromCode || !toCode) {
    throw new AppError("FROM and TO are required", 400);
  }

  const ffCodes = await getFrankfurterCodes();
  const canUseFrankfurter = ffCodes.includes(fromCode) && ffCodes.includes(toCode);

  let result;
  let providerDate = null;
  let provider = null;

  if (canUseFrankfurter) {
    const data = await fetchFrankfurter(
      `latest?amount=${encodeURIComponent(numericAmount)}&from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}`
    );

    result = data?.rates?.[toCode];
    providerDate = data?.date || null;
    provider = "frankfurter";

    if (!Number.isFinite(result)) {
      throw new AppError("Frankfurter returned invalid rate", 500);
    }
  } else {
    const nbu = await fetchNBU();
    result = convertViaUAH(numericAmount, fromCode, toCode, nbu.rates);
    providerDate = nbu.providerDate || null;
    provider = "nbu";
  }

  return {
    from: fromCode,
    to: toCode,
    amount: numericAmount,
    result,
    providerDate,
    provider,
    serverTime: new Date().toISOString(),
  };
}

export async function convertCurrencyBatch({ amount, from, tos }) {
  const numericAmount = Number(amount);
  const fromCode = String(from || "").toUpperCase();
  const toList = Array.isArray(tos)
    ? tos.map((item) => String(item || "").toUpperCase()).filter(Boolean).filter((item) => item !== fromCode)
    : [];

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new AppError("Invalid amount", 400);
  }

  if (!fromCode || !toList.length) {
    throw new AppError("from and tos are required", 400);
  }

  const ffCodes = await getFrankfurterCodes();
  const canUseFrankfurter = ffCodes.includes(fromCode) && toList.every((item) => ffCodes.includes(item));

  if (canUseFrankfurter) {
    const data = await fetchFrankfurter(
      `latest?amount=${encodeURIComponent(numericAmount)}&from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toList.join(","))}`
    );

    return {
      from: fromCode,
      amount: numericAmount,
      rates: data.rates || {},
      providerDate: data.date || null,
      provider: "frankfurter",
      serverTime: new Date().toISOString(),
    };
  }

  const nbu = await fetchNBU();
  const rates = {};

  for (const toCode of toList) {
    rates[toCode] = convertViaUAH(numericAmount, fromCode, toCode, nbu.rates);
  }

  return {
    from: fromCode,
    amount: numericAmount,
    rates,
    providerDate: nbu.providerDate || null,
    provider: "nbu",
    serverTime: new Date().toISOString(),
  };
}