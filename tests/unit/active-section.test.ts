import { describe, expect, it } from 'vitest';
import { pickActiveSection } from '../../src/lib/active-section';

const sections = [
  { id: 'about', top: 56 },
  { id: 'experience', top: 400 },
  { id: 'projects', top: 900 },
];

describe('pickActiveSection', () => {
  it('starts on the first section at the top of the page', () => {
    expect(pickActiveSection(sections, { readingLine: 280, atTop: true, atBottom: false })).toBe(
      'about',
    );
  });

  it('picks the first section at the top even when the next one is above the line', () => {
    const short = [
      { id: 'about', top: 56 },
      { id: 'experience', top: 190 },
    ];
    expect(pickActiveSection(short, { readingLine: 280, atTop: true, atBottom: false })).toBe(
      'about',
    );
  });

  it('picks the last section that passed the reading line', () => {
    const scrolled = sections.map((s) => ({ ...s, top: s.top - 500 }));
    expect(pickActiveSection(scrolled, { readingLine: 280, atTop: false, atBottom: false })).toBe(
      'experience',
    );
  });

  it('picks the last section at the bottom of the page', () => {
    expect(pickActiveSection(sections, { readingLine: 280, atTop: false, atBottom: true })).toBe(
      'projects',
    );
  });

  it('returns nothing when there are no sections', () => {
    expect(
      pickActiveSection([], { readingLine: 280, atTop: true, atBottom: false }),
    ).toBeUndefined();
  });
});
