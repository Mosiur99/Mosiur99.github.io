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
