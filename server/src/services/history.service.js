import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, "../../data/history.json");

function ensureHistoryFile() {
  const dir = path.dirname(HISTORY_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, "[]", "utf-8");
  }
}

function readAll() {
  ensureHistoryFile();

  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new AppError("Failed to read history storage", 500);
  }
}

function writeAll(items) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function getHistory(limit = env.historyDefaultLimit) {
  const items = readAll();
  return items.slice(0, limit);
}

export function addHistoryItem(entry) {
  const items = readAll();
  items.unshift(entry);
  const trimmed = items.slice(0, env.historyMaxItems);
  writeAll(trimmed);
  return trimmed;
}

export function clearHistory() {
  writeAll([]);
  return [];
}