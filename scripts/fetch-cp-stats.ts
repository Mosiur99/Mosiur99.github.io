import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { judgeSchema } from '../src/content/schemas';
import { fetchCodeforces } from '../src/lib/cp/codeforces';
import { fetchLeetCode } from '../src/lib/cp/leetcode';
import { buildStats } from '../src/lib/cp/stats';
import { cpStatsSchema, type CpStats } from '../src/lib/cp/types';

const JUDGES = 'src/content/judges.yaml';
const OUTPUT = 'src/data/cp-stats.json';

function readPrevious(): CpStats | null {
  if (!existsSync(OUTPUT)) return null;
  const parsed = cpStatsSchema.safeParse(JSON.parse(readFileSync(OUTPUT, 'utf8')));
  if (!parsed.success) {
    console.warn(`${OUTPUT} is not valid, so no earlier values can be reused`);
    return null;
  }
  return parsed.data;
}

const judges = Object.values(parse(readFileSync(JUDGES, 'utf8')) as Record<string, unknown>).map(
  (judge) => judgeSchema.parse(judge),
);

const { stats, warnings } = await buildStats(judges, readPrevious(), {
  codeforces: (handle) => fetchCodeforces(handle),
  leetcode: (handle) => fetchLeetCode(handle),
});

warnings.forEach((warning) => console.warn(`warning: ${warning}`));

if (stats.platforms.length === 0) {
  console.error('No platform data at all, so the stats file was not changed');
  process.exit(1);
}

writeFileSync(OUTPUT, `${JSON.stringify(cpStatsSchema.parse(stats), null, 2)}\n`);
console.log(`Wrote ${OUTPUT}: ${stats.totalSolved} problems solved`);
for (const p of stats.platforms) {
  console.log(`  ${p.platform.padEnd(11)} ${String(p.solved).padStart(5)}  (${p.source})`);
}
