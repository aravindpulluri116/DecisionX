/**
 * Bakes judge demo packs to JSON fixtures for offline bundling / verification.
 * Run: npm run bake:judge-fixtures
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JUDGE_DEMO_PACKS } from "../src/lib/judge/buildDemoPack";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../src/lib/judge/fixtures");

mkdirSync(outDir, { recursive: true });

const fileMap: Record<string, string> = {
  metro: "metro.json",
  industrial: "industrial.json",
  flyover: "flyover.json",
};

for (const [id, filename] of Object.entries(fileMap)) {
  const pack = JUDGE_DEMO_PACKS[id];
  if (!pack) {
    console.error(`Missing pack: ${id}`);
    process.exit(1);
  }
  const path = join(outDir, filename);
  writeFileSync(path, JSON.stringify(pack, null, 2), "utf8");
  console.log(`Wrote ${path}`);
}

console.log(`Baked ${Object.keys(fileMap).length} judge demo packs.`);
