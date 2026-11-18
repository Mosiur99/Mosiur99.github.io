import { describe, expect, it } from 'vitest';
import {
  companySpan,
  formatDuration,
  formatMonth,
  formatRange,
  monthsInclusive,
  sortRolesNewestFirst,
} from '../../src/lib/dates';

describe('formatMonth', () => {
  it('turns YYYY-MM into a short month and year', () => {
    expect(formatMonth('2024-07')).toBe('Jul 2024');
    expect(formatMonth('2019-01')).toBe('Jan 2019');
    expect(formatMonth('2025-12')).toBe('Dec 2025');
  });
});

describe('formatRange', () => {
  it('shows Present for an open role', () => {
    expect(formatRange('2024-07', null)).toBe('Jul 2024 – Present');
  });

  it('shows both months for a finished role', () => {
    expect(formatRange('2024-03', '2024-06')).toBe('Mar 2024 – Jun 2024');
  });
});

describe('monthsInclusive', () => {
  it('counts both the first and last month', () => {
    expect(monthsInclusive('2024-03', '2024-06')).toBe(4);
    expect(monthsInclusive('2024-03', '2024-03')).toBe(1);
  });

  it('counts across years', () => {
    expect(monthsInclusive('2023-11', '2024-02')).toBe(4);
  });

  it('uses the given date for open roles', () => {
    expect(monthsInclusive('2024-03', null, new Date(2026, 10, 18))).toBe(33);
  });
});

describe('formatDuration', () => {
  it.each([
    [1, '1 mo'],
    [4, '4 mos'],
    [12, '1 yr'],
    [13, '1 yr 1 mo'],
    [24, '2 yrs'],
    [33, '2 yrs 9 mos'],
  ])('formats %i months as %s', (months, text) => {
    expect(formatDuration(months)).toBe(text);
  });
});

describe('companySpan', () => {
  const roles = [
    { start: '2024-07', end: null },
    { start: '2024-03', end: '2024-06' },
  ];

  it('runs from the first start to the open end', () => {
    expect(companySpan(roles)).toEqual({ start: '2024-03', end: null });
  });

  it('ends at the latest end when all roles are finished', () => {
    const finished = [
      { start: '2020-01', end: '2021-06' },
      { start: '2021-07', end: '2022-12' },
    ];
    expect(companySpan(finished)).toEqual({ start: '2020-01', end: '2022-12' });
  });
});

describe('sortRolesNewestFirst', () => {
  it('puts the open role first, then by start month', () => {
    const roles = [
      { title: 'Intern', start: '2024-03', end: '2024-06' },
      { title: 'Engineer', start: '2024-07', end: null },
      { title: 'Trainee', start: '2023-10', end: '2024-02' },
    ];
    expect(sortRolesNewestFirst(roles).map((r) => r.title)).toEqual([
      'Engineer',
      'Intern',
      'Trainee',
    ]);
  });

  it('does not change the original list', () => {
    const roles = [
      { title: 'A', start: '2020-01', end: '2020-02' },
      { title: 'B', start: '2021-01', end: null },
    ];
    sortRolesNewestFirst(roles);
    expect(roles[0]?.title).toBe('A');
  });
});
