import { describe, expect, it } from 'vitest';
import { parseTheme, resolveTheme, toggleTheme } from '../../src/lib/theme';

describe('parseTheme', () => {
  it.each(['light', 'dark'] as const)('accepts %s', (value) => {
    expect(parseTheme(value)).toBe(value);
  });

  it.each([null, undefined, '', 'system', 'DARK', 1])('ignores %s', (value) => {
    expect(parseTheme(value)).toBeNull();
  });
});

describe('resolveTheme', () => {
  it('prefers the saved choice over the system setting', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('falls back to the system setting', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
});

describe('toggleTheme', () => {
  it('switches between light and dark', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});
