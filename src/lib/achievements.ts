import type { Achievement } from '../content/schemas';
import { formatMonth } from './dates';

const sortKey = (a: Achievement) => (a.endYear ?? a.year) * 100 + (a.endYear ? 12 : (a.month ?? 0));

export function sortAchievements(list: Achievement[]): Achievement[] {
  return [...list].sort((a, b) => sortKey(b) - sortKey(a));
}

export function achievementDate(a: Achievement): string {
  if (a.endYear) return `${a.year} – ${a.endYear}`;
  if (a.month) return formatMonth(`${a.year}-${String(a.month).padStart(2, '0')}`);
  return String(a.year);
}

export interface AchievementGroups {
  featured: Achievement[];
  cards: Achievement[];
  more: Achievement[];
}

// Contest wins come before problem setting and teaching on the cards.
const categoryOrder: Achievement['category'][] = ['icpc', 'contest', 'setting', 'mentoring'];

/**
 * Splits results into the ICPC card, the summary cards and the remaining list. Each group is
 * newest first; the cards put contest results before problem setting and teaching.
 */
export function groupAchievements(list: Achievement[]): AchievementGroups {
  const sorted = sortAchievements(list);
  return {
    featured: sorted.filter((a) => a.featured),
    cards: sorted
      .filter((a) => !a.featured && a.summary)
      .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)),
    more: sorted.filter((a) => !a.featured && !a.summary),
  };
}
