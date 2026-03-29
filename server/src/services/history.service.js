import { pool } from "./db.service.js";
import { env } from "../config/env.js";

export async function getHistory(limit = env.historyDefaultLimit) {
  const result = await pool.query(
    `
    SELECT id, type, input, output, payload, ts
    FROM history_items
    ORDER BY ts DESC, id DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function addHistoryItem(entry) {
  await pool.query(
    `
    INSERT INTO history_items (type, input, output, payload, ts)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      entry.type,
      entry.input,
      entry.output,
      entry.payload ?? null,
      entry.ts ? new Date(entry.ts) : new Date(),
    ]
  );

  await pool.query(
    `
    DELETE FROM history_items
    WHERE id NOT IN (
      SELECT id
      FROM history_items
      ORDER BY ts DESC, id DESC
      LIMIT $1
    )
    `,
    [env.historyMaxItems]
  );

  return true;
}

export async function clearHistory() {
  await pool.query(`DELETE FROM history_items`);
  return [];
}