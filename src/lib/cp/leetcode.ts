import { z } from 'astro/zod';
import { getJson, type RequestOptions } from './http';
import type { FetchedPlatform } from './types';

const ENDPOINT = 'https://leetcode.com/graphql';

const QUERY = `query profile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  userContestRanking(username: $username) { rating }
}`;

const responseSchema = z.object({
  data: z.object({
    matchedUser: z
      .object({
        submitStatsGlobal: z.object({
          acSubmissionNum: z.array(z.object({ difficulty: z.string(), count: z.number().int() })),
        }),
      })
      .nullable(),
    userContestRanking: z.object({ rating: z.number() }).nullable().optional(),
  }),
});

export function parseLeetCode(body: unknown, username: string): FetchedPlatform {
  const { data } = responseSchema.parse(body);
  if (!data.matchedUser) throw new Error(`LeetCode: user ${username} not found`);
  const all = data.matchedUser.submitStatsGlobal.acSubmissionNum.find(
    (s) => s.difficulty === 'All',
  );
  if (!all) throw new Error('LeetCode: response has no "All" solved count');
  const rating = data.userContestRanking?.rating;
  return { solved: all.count, rating: rating === undefined ? undefined : Math.round(rating) };
}

export async function fetchLeetCode(
  username: string,
  options: RequestOptions = {},
): Promise<FetchedPlatform> {
  const body = await getJson(
    ENDPOINT,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/${username}/` },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
    },
    options,
  );
  return parseLeetCode(body, username);
}
