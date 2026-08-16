#!/usr/bin/env node
/**
 * Syncs root JSON data files from src/data/ to public/data/.
 * src/data/ is the single source of truth; public/data/ serves the
 * static "API endpoints" and must never be edited by hand.
 *
 * - Copies every src/data/*.json (excluding subdirectories) to public/data/.
 * - Fails the build if any JSON file is malformed.
 * - Reports (without failing) files in public/data/ that no longer exist
 *   in src/data/ so they can be removed.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = "src/data";
const DEST = "public/data";

mkdirSync(DEST, { recursive: true });

const srcFiles = readdirSync(SRC).filter((f) => f.endsWith(".json"));

if (srcFiles.length === 0) {
  console.error(`[sync-public-data] No JSON files found in ${SRC} — aborting.`);
  process.exit(1);
}

for (const file of srcFiles) {
  const srcPath = join(SRC, file);
  const raw = readFileSync(srcPath, "utf8");
  try {
    JSON.parse(raw);
  } catch (err) {
    console.error(`[sync-public-data] Malformed JSON: ${srcPath}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
  cpSync(srcPath, join(DEST, file));
}

let copied = 0;
for (const file of readdirSync(DEST)) {
  if (file.endsWith(".json") && !srcFiles.includes(file)) {
    console.warn(`[sync-public-data] Orphaned in public/data (left in place): ${file}`);
  }
  if (file.endsWith(".json") && srcFiles.includes(file)) copied++;
}

console.log(`[sync-public-data] Synced ${copied} JSON file(s): ${SRC} → ${DEST}`);
