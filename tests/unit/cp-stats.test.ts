import { describe, expect, it, vi } from 'vitest';
import type { Judge } from '../../src/content/schemas';
import { buildStats } from '../../src/lib/cp/stats';
import { cpStatsSchema, type CpStats } from '../../src/lib/cp/types';

const now = new Date('2026-11-18T12:00:00.000Z');
const cf: Judge = {
  platform: 'codeforces',
  handle: 'mosiur_zaman',
  url: 'https://codeforces.com/profile/mosiur_zaman',
  source: 'api',
};
const lc: Judge = {
  platform: 'leetcode',
  handle: 'mosiur',
  url: 'https://leetcode.com/mosiur',
  source: 'api',
};
const chef: Judge = {
  platform: 'codechef',
  handle: 'chef',
  url: 'https://www.codechef.com/users/chef',
  source: 'manual',
  manual: { solved: 200, maxRating: 1700, asOf: '2026-10' },
};
const history = [
  { contestId: 1, contestName: 'Round 1', date: '2024-01-01T00:00:00.000Z', rating: 1400 },
];

const previous: CpStats = {
  fetchedAt: '2026-11-17T12:00:00.000Z',
  totalSolved: 1900,
  platforms: [
    { ...cf, solved: 1600, rating: 1240, source: 'api', asOf: '2026-11-17T12:00:00.000Z' },
    { ...lc, solved: 300, source: 'api', asOf: '2026-11-17T12:00:00.000Z' },
  ],
  codeforcesHistory: history,
};

const ok = (solved: number, extra = {}) => vi.fn().mockResolvedValue({ solved, ...extra });
const fail = (message: string) => vi.fn().mockRejectedValue(new Error(message));

describe('buildStats', () => {
  it('uses fresh API data and adds up the total', async () => {
    const { stats, warnings } = await buildStats(
      [cf, lc],
      null,
      { codeforces: ok(1606, { rating: 1240, history }), leetcode: ok(327) },
      now,
    );
    expect(warnings).toEqual([]);
    expect(stats.totalSolved).toBe(1933);
    expect(stats.platforms.map((p) => p.source)).toEqual(['api', 'api']);
    expect(stats.codeforcesHistory).toEqual(history);
    expect(cpStatsSchema.safeParse(stats).success).toBe(true);
  });

  it('keeps the earlier value when one platform fails', async () => {
    const { stats, warnings } = await buildStats(
      [cf, lc],
      previous,
      { codeforces: ok(1606), leetcode: fail('LeetCode answered 503') },
      now,
    );
    const leetcode = stats.platforms.find((p) => p.platform === 'leetcode');
    expect(leetcode).toMatchObject({ solved: 300, source: 'cached' });
    expect(stats.totalSolved).toBe(1906);
    expect(warnings).toEqual([
      'leetcode: LeetCode answered 503; kept the value from 2026-11-17T12:00:00.000Z',
    ]);
  });

  it('keeps the earlier rating history when Codeforces fails', async () => {
    const { stats } = await buildStats([cf], previous, { codeforces: fail('timeout') }, now);
    expect(stats.codeforcesHistory).toEqual(history);
    expect(stats.platforms[0]?.source).toBe('cached');
  });

  it('leaves a platform out rather than showing zero when there is no earlier value', async () => {
    const { stats, warnings } = await buildStats([cf, lc], null, {
      codeforces: ok(1606),
      leetcode: fail('timeout'),
    });
    expect(stats.platforms.map((p) => p.platform)).toEqual(['codeforces']);
    expect(warnings[0]).toContain('left out');
  });

  it('does not reuse a cached value from a different handle', async () => {
    const renamed = { ...lc, handle: 'new_name' };
    const { stats } = await buildStats([renamed], previous, { leetcode: fail('timeout') });
    expect(stats.platforms).toEqual([]);
  });

  it('takes manual platforms as written', async () => {
    const fetcher = vi.fn();
    const { stats } = await buildStats([chef], null, { codechef: fetcher }, now);
    expect(fetcher).not.toHaveBeenCalled();
    expect(stats.platforms[0]).toMatchObject({
      solved: 200,
      maxRating: 1700,
      source: 'manual',
      asOf: '2026-10-01T00:00:00.000Z',
    });
  });

  it('warns about API platforms that have no client', async () => {
    const atcoder: Judge = { ...cf, platform: 'atcoder', url: 'https://atcoder.jp/users/x' };
    const { warnings } = await buildStats([atcoder], null, {});
    expect(warnings[0]).toContain('no API client for atcoder');
  });
});
