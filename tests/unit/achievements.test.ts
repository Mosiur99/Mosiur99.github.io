import { describe, expect, it } from 'vitest';
import type { Achievement } from '../../src/content/schemas';
import { achievementDate, groupAchievements, sortAchievements } from '../../src/lib/achievements';

const make = (title: string, extra: Partial<Achievement>): Achievement => ({
  title,
  result: '1st',
  category: 'contest',
  year: 2023,
  featured: false,
  links: [],
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

describe('groupAchievements', () => {
  it('splits featured results, summary cards and the rest, each newest first', () => {
    const list = [
      make('icpc 2021', { year: 2021, featured: true }),
      make('icpc 2022', { year: 2022, featured: true }),
      make('champion', { summary: 'Won it' }),
      make('older contest', { year: 2022 }),
      make('newer contest', { year: 2024 }),
    ];
    const groups = groupAchievements(list);
    expect(groups.featured.map((a) => a.title)).toEqual(['icpc 2022', 'icpc 2021']);
    expect(groups.cards.map((a) => a.title)).toEqual(['champion']);
    expect(groups.more.map((a) => a.title)).toEqual(['newer contest', 'older contest']);
  });

  it('shows contest results before problem setting and teaching on the cards', () => {
    const list = [
      make('trainer', { year: 2024, category: 'mentoring', summary: 'Taught' }),
      make('setter', { year: 2024, category: 'setting', summary: 'Set problems' }),
      make('older win', { year: 2021, summary: 'Won' }),
      make('newer win', { year: 2022, summary: 'Won' }),
    ];
    expect(groupAchievements(list).cards.map((a) => a.title)).toEqual([
      'newer win',
      'older win',
      'setter',
      'trainer',
    ]);
  });

  it('puts every result in exactly one group', () => {
    const list = [make('a', { featured: true }), make('b', { summary: 'S' }), make('c', {})];
    const { featured, cards, more } = groupAchievements(list);
    expect(featured.length + cards.length + more.length).toBe(list.length);
  });
});
