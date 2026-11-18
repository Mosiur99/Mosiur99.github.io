import { z } from 'astro/zod';
import { getJson, type RequestOptions } from './http';
import type { FetchedPlatform } from './types';

const ACCEPTED = 90;

const subsSchema = z.object({
  subs: z.array(z.array(z.number()).min(3)),
});

export function parseUva(body: unknown): FetchedPlatform {
  const { subs } = subsSchema.parse(body);
  const solved = new Set(subs.filter((sub) => sub[2] === ACCEPTED).map((sub) => sub[1]));
  return { solved: solved.size };
}

export async function fetchUva(
  userId: string,
  options: RequestOptions = {},
): Promise<FetchedPlatform> {
  if (!/^\d+$/.test(userId)) throw new Error(`UVa: user id must be a number, got ${userId}`);
  return parseUva(
    await getJson(`https://uhunt.onlinejudge.org/api/subs-user/${userId}`, {}, options),
  );
}
