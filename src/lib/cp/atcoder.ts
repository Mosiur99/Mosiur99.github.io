import { z } from 'astro/zod';
import { getJson, type RequestOptions } from './http';
import type { FetchedPlatform } from './types';

const acRankSchema = z.object({ count: z.number().int().nonnegative() });

const historySchema = z.array(z.object({ IsRated: z.boolean(), NewRating: z.number().int() }));

export function parseAtCoder(acRank: unknown, history: unknown): FetchedPlatform {
  const { count } = acRankSchema.parse(acRank);
  const rated = historySchema.parse(history).filter((entry) => entry.IsRated);
  const ratings = rated.map((entry) => entry.NewRating);
  return {
    solved: count,
    rating: ratings.at(-1),
    maxRating: ratings.length > 0 ? Math.max(...ratings) : undefined,
  };
}

export async function fetchAtCoder(
  user: string,
  options: RequestOptions = {},
): Promise<FetchedPlatform> {
  const u = encodeURIComponent(user);
  const acRank = await getJson(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${u}`,
    {},
    options,
  );
  const history = await getJson(`https://atcoder.jp/users/${u}/history/json`, {}, options);
  return parseAtCoder(acRank, history);
}
