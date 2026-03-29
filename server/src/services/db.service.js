import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS history_items (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      input TEXT NOT NULL,
      output TEXT NOT NULL,
      payload JSONB,
      ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}