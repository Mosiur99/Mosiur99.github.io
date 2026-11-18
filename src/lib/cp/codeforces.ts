import { z } from 'astro/zod';
import { getJson, type RequestOptions } from './http';
import type { FetchedPlatform, RatingPoint } from './types';

const API = 'https://codeforces.com/api';

const envelope = <T extends z.ZodType>(result: T) =>
  z.discriminatedUnion('status', [
    z.object({ status: z.literal('OK'), result }),
    z.object({ status: z.literal('FAILED'), comment: z.string() }),
  ]);

const userInfoSchema = envelope(
  z
    .array(
      z.object({
        handle: z.string(),
        rating: z.number().int().optional(),
        maxRating: z.number().int().optional(),
        rank: z.string().optional(),
      }),
    )
    .length(1),
);

const ratingSchema = envelope(
  z.array(
    z.object({
      contestId: z.number().int(),
      contestName: z.string(),
      ratingUpdateTimeSeconds: z.number().int(),
      newRating: z.number().int(),
    }),
  ),
);

const statusSchema = envelope(
  z.array(
    z.object({
      problem: z.object({ contestId: z.number().int().optional(), index: z.string() }),
      verdict: z.string().optional(),
    }),
  ),
);

type Submissions = Extract<z.infer<typeof statusSchema>, { status: 'OK' }>['result'];

function unwrap<T>(data: { status: 'OK'; result: T } | { status: 'FAILED'; comment: string }): T {
  if (data.status === 'FAILED') throw new Error(`Codeforces: ${data.comment}`);
  return data.result;
}

export function countSolved(submissions: Submissions): number {
  const solved = new Set(
    submissions
      .filter((s) => s.verdict === 'OK')
      .map((s) => `${s.problem.contestId ?? 'none'}-${s.problem.index}`),
  );
  return solved.size;
}

export function toHistory(
  changes: Extract<z.infer<typeof ratingSchema>, { status: 'OK' }>['result'],
): RatingPoint[] {
  return changes.map((c) => ({
    contestId: c.contestId,
    contestName: c.contestName,
    date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString(),
    rating: c.newRating,
  }));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchCodeforces(
  handle: string,
  { gapMs = 2_100, ...options }: RequestOptions & { gapMs?: number } = {},
): Promise<FetchedPlatform> {
  const h = encodeURIComponent(handle);
  const [user] = unwrap(
    userInfoSchema.parse(await getJson(`${API}/user.info?handles=${h}`, {}, options)),
  );
  await sleep(gapMs);
  const changes = unwrap(
    ratingSchema.parse(await getJson(`${API}/user.rating?handle=${h}`, {}, options)),
  );
  await sleep(gapMs);
  const submissions = unwrap(
    statusSchema.parse(await getJson(`${API}/user.status?handle=${h}`, {}, options)),
  );
  return {
    solved: countSolved(submissions),
    rating: user?.rating,
    maxRating: user?.maxRating,
    rank: user?.rank,
    history: toHistory(changes),
  };
}
