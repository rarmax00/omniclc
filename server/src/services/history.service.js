import { pool } from "./db.service.js";
import { env } from "../config/env.js";

function roundSmart(num) {
  if (!Number.isFinite(num)) return num;
  return Math.round(num * 100) / 100;
}

function normalizeOutput(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    return String(roundSmart(value));
  }

  const raw = String(value).trim();
  if (!raw) return "";

  // якщо це просто число рядком
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return String(roundSmart(Number(raw)));
  }

  // якщо це рядок типу "43.17999999999999 cm"
  const matchNumberWithUnit = raw.match(/^(-?\d+(?:\.\d+)?)(\s+[^\s].*)$/);
  if (matchNumberWithUnit) {
    const num = Number(matchNumberWithUnit[1]);
    const suffix = matchNumberWithUnit[2];
    if (!Number.isNaN(num)) {
      return `${roundSmart(num)}${suffix}`;
    }
  }

  return raw;
}

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
  const normalized = {
    type: String(entry.type ?? "").trim(),
    input: String(entry.input ?? "").trim(),
    output: normalizeOutput(entry.output),
    payload: entry.payload ?? null,
    ts: entry.ts ? new Date(entry.ts) : new Date(),
  };

  // Жорсткіший антидубль: 30 секунд
  const duplicateCheck = await pool.query(
    `
    SELECT id
    FROM history_items
    WHERE type = $1
      AND input = $2
      AND output = $3
      AND ts > NOW() - INTERVAL '30 seconds'
    ORDER BY ts DESC
    LIMIT 1
    `,
    [normalized.type, normalized.input, normalized.output]
  );

  if (duplicateCheck.rows.length > 0) {
    return false;
  }

  await pool.query(
    `
    INSERT INTO history_items (type, input, output, payload, ts)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      normalized.type,
      normalized.input,
      normalized.output,
      normalized.payload,
      normalized.ts,
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