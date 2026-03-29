export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",

  fxTtlMs: 30 * 60 * 1000,
  nbuTtlMs: 6 * 60 * 60 * 1000,
  currenciesTtlMs: 24 * 60 * 60 * 1000,

  historyMaxItems: 50,
  historyDefaultLimit: 20,
  historyMaxLimit: 50,

  databaseUrl: process.env.DATABASE_URL || "",
};