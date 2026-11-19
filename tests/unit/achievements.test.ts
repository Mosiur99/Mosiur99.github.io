import { describe, expect, it } from 'vitest';
import type { Achievement } from '../../src/content/schemas';
import { achievementDate, sortAchievements } from '../../src/lib/achievements';

const make = (title: string, extra: Partial<Achievement>): Achievement => ({
  title,
  result: '1st',
  category: 'contest',
  year: 2023,
  ...extra,
});

describe('achievementDate', () => {
  it('shows the month when there is one', () => {
    expect(achievementDate(make('a', { year: 2024, month: 3 }))).toBe('Mar 2024');
  });

  it('shows the year alone without a month', () => {
    expect(achievementDate(make('a', { year: 2022 }))).toBe('2022');
  });

  it('shows a year range for ongoing roles', () => {
    expect(achievementDate(make('a', { year: 2020, endYear: 2024 }))).toBe('2020 – 2024');
  });
});

describe('sortAchievements', () => {
  it('puts the newest first, using the month inside a year', () => {
    const list = [
      make('jan', { month: 1 }),
      make('older', { year: 2022, month: 12 }),
      make('oct', { month: 10 }),
      make('year only', {}),
    ];
    expect(sortAchievements(list).map((a) => a.title)).toEqual([
      'oct',
      'jan',
      'year only',
      'older',
    ]);
  });

  it('sorts a range by its end year', () => {
    const list = [
      make('contest', { year: 2023, month: 9 }),
      make('range', { year: 2020, endYear: 2024 }),
    ];
    expect(sortAchievements(list)[0]?.title).toBe('range');
  });

  it('does not change the input', () => {
    const list = [make('a', { month: 1 }), make('b', { month: 2 })];
    sortAchievements(list);
    expect(list.map((a) => a.title)).toEqual(['a', 'b']);
  });
});
