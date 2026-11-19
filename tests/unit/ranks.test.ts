import { describe, expect, it } from 'vitest';
import { ratingTitle } from '../../src/lib/cp/ranks';

describe('ratingTitle', () => {
  it('uses the Codeforces rank names', () => {
    expect(ratingTitle('codeforces', 1434)).toBe('Specialist');
    expect(ratingTitle('codeforces', 1399)).toBe('Pupil');
  });

  it('counts CodeChef stars at the band edges', () => {
    expect(ratingTitle('codechef', 1889)).toBe('4★');
    expect(ratingTitle('codechef', 1799)).toBe('3★');
    expect(ratingTitle('codechef', 1800)).toBe('4★');
    expect(ratingTitle('codechef', 900)).toBe('1★');
  });

  it('names the AtCoder colour', () => {
    expect(ratingTitle('atcoder', 928)).toBe('Green');
    expect(ratingTitle('atcoder', 1200)).toBe('Cyan');
    expect(ratingTitle('atcoder', 399)).toBe('Grey');
  });

  it('has no title for judges without rating tiers', () => {
    expect(ratingTitle('leetcode', 1613)).toBeUndefined();
  });
});
