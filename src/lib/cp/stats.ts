import type { Judge } from '../../content/schemas';
import type { CpStats, FetchedPlatform, PlatformStats } from './types';

export type Fetcher = (handle: string) => Promise<FetchedPlatform>;

export interface BuildResult {
  stats: CpStats;
  warnings: string[];
}

function monthToIso(yearMonth: string): string {
  return new Date(`${yearMonth}-01T00:00:00.000Z`).toISOString();
}

export async function buildStats(
  judges: Judge[],
  previous: CpStats | null,
  fetchers: Partial<Record<Judge['platform'], Fetcher>>,
  now = new Date(),
): Promise<BuildResult> {
  const warnings: string[] = [];
  const platforms: PlatformStats[] = [];
  let history = previous?.codeforcesHistory ?? [];

  for (const judge of judges) {
    const base = { platform: judge.platform, handle: judge.handle, url: judge.url };

    if (judge.source === 'manual' && judge.manual) {
      platforms.push({
        ...base,
        solved: judge.manual.solved,
        maxRating: judge.manual.maxRating,
        source: 'manual',
        asOf: monthToIso(judge.manual.asOf),
      });
      continue;
    }

    const fetcher = fetchers[judge.platform];
    try {
      if (!fetcher) throw new Error(`no API client for ${judge.platform}`);
      const fetched = await fetcher(judge.handle);
      platforms.push({
        ...base,
        solved: fetched.solved,
        rating: fetched.rating,
        maxRating: fetched.maxRating,
        rank: fetched.rank,
        source: 'api',
        asOf: now.toISOString(),
      });
      if (judge.platform === 'codeforces' && fetched.history) history = fetched.history;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      const cached = previous?.platforms.find(
        (p) => p.platform === judge.platform && p.handle === judge.handle,
      );
      if (cached) {
        platforms.push({ ...cached, source: 'cached' });
        warnings.push(`${judge.platform}: ${reason}; kept the value from ${cached.asOf}`);
      } else {
        warnings.push(`${judge.platform}: ${reason}; no earlier value, so it is left out`);
      }
    }
  }

  return {
    stats: {
      fetchedAt: now.toISOString(),
      totalSolved: platforms.reduce((sum, p) => sum + p.solved, 0),
      platforms,
      codeforcesHistory: history,
    },
    warnings,
  };
}
