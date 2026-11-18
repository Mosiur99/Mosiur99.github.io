import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cpStatsSchema } from '../../src/lib/cp/types';

const file = join(import.meta.dirname, '../../src/data/cp-stats.json');

describe('committed cp-stats.json', () => {
  const stats = cpStatsSchema.parse(JSON.parse(readFileSync(file, 'utf8')));

  it('has a total that matches the platforms', () => {
    expect(stats.totalSolved).toBe(stats.platforms.reduce((sum, p) => sum + p.solved, 0));
  });

  it('keeps the rating history in date order', () => {
    const dates = stats.codeforcesHistory.map((point) => point.date);
    expect(dates).toEqual([...dates].sort());
  });
});
