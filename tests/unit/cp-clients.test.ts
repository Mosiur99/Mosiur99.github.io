import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { countSolved, fetchCodeforces } from '../../src/lib/cp/codeforces';
import { fetchAtCoder, parseAtCoder } from '../../src/lib/cp/atcoder';
import { fetchLeetCode, parseLeetCode } from '../../src/lib/cp/leetcode';
import { fetchUva, parseUva } from '../../src/lib/cp/uva';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures/cp', name), 'utf8'));
const respond = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body)));
const fast = { retryDelayMs: 0, gapMs: 0 };

function codeforcesFetch(overrides: Record<string, unknown> = {}) {
  const bodies: Record<string, unknown> = {
    'user.info': fixture('cf-user-info.json'),
    'user.rating': fixture('cf-user-rating.json'),
    'user.status': fixture('cf-user-status.json'),
    ...overrides,
  };
  return vi.fn((url: string) => {
    const method = Object.keys(bodies).find((m) => url.includes(`/${m}?`));
    return respond(method ? bodies[method] : {});
  });
}

describe('countSolved', () => {
  it('counts each accepted problem once', () => {
    const p = (contestId: number, index: string, verdict?: string) => ({
      problem: { contestId, index },
      verdict,
    });
    const submissions = [
      p(1, 'A', 'OK'),
      p(1, 'A', 'OK'),
      p(1, 'B', 'WRONG_ANSWER'),
      p(2, 'A', 'OK'),
      p(1, 'C'),
    ];
    expect(countSolved(submissions)).toBe(2);
  });
});

describe('fetchCodeforces', () => {
  it('combines profile, rating history and solved count', async () => {
    const fetch = codeforcesFetch();
    const stats = await fetchCodeforces('mosiur_zaman', { ...fast, fetch });
    expect(stats).toMatchObject({ solved: 3, rating: 1240, maxRating: 1434, rank: 'pupil' });
    expect(stats.history).toHaveLength(4);
    expect(stats.history?.[0]).toEqual({
      contestId: 1154,
      contestName: 'Codeforces Round 552 (Div. 3)',
      date: '2019-04-16T16:35:00.000Z',
      rating: 1367,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('encodes the handle in the URL', async () => {
    const fetch = codeforcesFetch();
    await fetchCodeforces('a b', { ...fast, fetch });
    expect(fetch.mock.calls[0]?.[0]).toContain('handles=a%20b');
  });

  it('reports an unknown handle', async () => {
    const fetch = codeforcesFetch({ 'user.info': fixture('cf-not-found.json') });
    await expect(fetchCodeforces('nobody_zz', { ...fast, fetch })).rejects.toThrow(
      'Codeforces: handle: User with handle nobody_zz not found',
    );
  });

  it('rejects a response with an unexpected shape', async () => {
    const fetch = codeforcesFetch({ 'user.rating': { status: 'OK', result: 'oops' } });
    await expect(fetchCodeforces('mosiur_zaman', { ...fast, fetch })).rejects.toThrow();
  });
});

describe('LeetCode', () => {
  it('reads the solved count and rounds the contest rating', () => {
    expect(parseLeetCode(fixture('leetcode-profile.json'), 'mosiur')).toEqual({
      solved: 327,
      rating: 1613,
    });
  });

  it('reports an unknown user', () => {
    expect(() => parseLeetCode(fixture('leetcode-not-found.json'), 'nobody')).toThrow(
      'LeetCode: user nobody not found',
    );
  });

  it('works for users who never joined a contest', () => {
    const body = {
      data: {
        matchedUser: {
          submitStatsGlobal: { acSubmissionNum: [{ difficulty: 'All', count: 10 }] },
        },
        userContestRanking: null,
      },
    };
    expect(parseLeetCode(body, 'new')).toEqual({ solved: 10, rating: undefined });
  });

  it('sends a GraphQL POST with the username', async () => {
    const fetch = vi.fn(() => respond(fixture('leetcode-profile.json')));
    await fetchLeetCode('mosiur', { retryDelayMs: 0, fetch });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://leetcode.com/graphql');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string).variables).toEqual({ username: 'mosiur' });
  });
});

describe('AtCoder', () => {
  it('reads the accepted count and uses only rated contests for ratings', () => {
    const stats = parseAtCoder(fixture('atcoder-ac-rank.json'), fixture('atcoder-history.json'));
    expect(stats).toEqual({ solved: 479, rating: 747, maxRating: 747 });
  });

  it('has no rating before the first rated contest', () => {
    expect(parseAtCoder({ count: 5 }, [])).toEqual({
      solved: 5,
      rating: undefined,
      maxRating: undefined,
    });
  });

  it('calls both endpoints with the encoded user name', async () => {
    const fetch = vi.fn((url: string) => respond(url.includes('kenkoooo') ? { count: 1 } : []));
    await fetchAtCoder('L_nai', { retryDelayMs: 0, fetch });
    expect(fetch.mock.calls.map((c) => c[0])).toEqual([
      'https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=L_nai',
      'https://atcoder.jp/users/L_nai/history/json',
    ]);
  });
});

describe('UVa', () => {
  it('counts each accepted problem once', () => {
    expect(parseUva(fixture('uva-subs.json'))).toEqual({ solved: 3 });
  });

  it('rejects a user id that is not a number', async () => {
    await expect(fetchUva('m_o_s_i_u_r')).rejects.toThrow('UVa: user id must be a number');
  });
});
