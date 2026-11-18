import { z } from 'astro/zod';
import { judgePlatforms } from '../../content/schemas';

export const platformStatsSchema = z.object({
  platform: z.enum(judgePlatforms),
  handle: z.string().min(1),
  url: z.url(),
  solved: z.number().int().nonnegative(),
  rating: z.number().int().optional(),
  maxRating: z.number().int().optional(),
  rank: z.string().optional(),
  source: z.enum(['api', 'manual', 'cached']),
  asOf: z.iso.datetime(),
});

export const ratingPointSchema = z.object({
  contestId: z.number().int(),
  contestName: z.string(),
  date: z.iso.datetime(),
  rating: z.number().int(),
});

export const cpStatsSchema = z.object({
  fetchedAt: z.iso.datetime(),
  totalSolved: z.number().int().nonnegative(),
  platforms: z.array(platformStatsSchema),
  codeforcesHistory: z.array(ratingPointSchema),
});

export type PlatformStats = z.infer<typeof platformStatsSchema>;
export type RatingPoint = z.infer<typeof ratingPointSchema>;
export type CpStats = z.infer<typeof cpStatsSchema>;

export interface FetchedPlatform {
  solved: number;
  rating?: number;
  maxRating?: number;
  rank?: string;
  history?: RatingPoint[];
}
