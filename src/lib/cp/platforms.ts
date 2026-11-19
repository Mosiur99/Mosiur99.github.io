import type { Judge } from '../../content/schemas';

export const platformNames: Record<Judge['platform'], string> = {
  codeforces: 'Codeforces',
  atcoder: 'AtCoder',
  codechef: 'CodeChef',
  leetcode: 'LeetCode',
  uva: 'UVa',
  spoj: 'SPOJ',
  lightoj: 'LightOJ',
  timus: 'Timus',
};

export const platformLogos: Record<Judge['platform'], string> = {
  codeforces: '/judges/codeforces.svg',
  atcoder: '/judges/atcoder.png',
  codechef: '/judges/codechef.svg',
  leetcode: '/judges/leetcode.svg',
  uva: '/judges/uva.png',
  spoj: '/judges/spoj.svg',
  lightoj: '/judges/lightoj.png',
  timus: '/judges/timus.png',
};
