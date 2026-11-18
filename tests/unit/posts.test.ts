import { describe, expect, it } from 'vitest';
import { formatPostDate, isPublished, readingMinutes, sortNewestFirst } from '../../src/lib/posts';

describe('readingMinutes', () => {
  it('counts about 200 words a minute', () => {
    expect(readingMinutes('word '.repeat(1000))).toBe(5);
  });

  it('never shows less than a minute', () => {
    expect(readingMinutes('short')).toBe(1);
  });

  it('ignores code blocks', () => {
    const code = '```java\n' + 'token '.repeat(2000) + '\n```';
    expect(readingMinutes(`${'word '.repeat(400)}${code}`)).toBe(2);
  });
});

describe('isPublished', () => {
  it('hides drafts', () => {
    expect(isPublished({ data: { draft: true } })).toBe(false);
    expect(isPublished({ data: { draft: false } })).toBe(true);
  });
});

describe('formatPostDate', () => {
  it('writes the full date in UTC', () => {
    expect(formatPostDate(new Date('2026-11-18T00:00:00Z'))).toBe('November 18, 2026');
  });
});

describe('sortNewestFirst', () => {
  it('orders posts by date, newest first', () => {
    const post = (id: string, date: string) => ({ id, data: { date: new Date(date) } });
    const sorted = sortNewestFirst([post('a', '2026-01-01'), post('b', '2026-03-01')]);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'a']);
  });
});
