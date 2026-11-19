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
