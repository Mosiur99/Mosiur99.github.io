import { describe, expect, it } from 'vitest';
import { icons } from '../../src/lib/icons';

describe('icons', () => {
  it.each(Object.entries(icons))('%s has a 24px viewBox and at least one path', (_, icon) => {
    expect(icon.viewBox).toBe('0 0 24 24');
    expect(icon.paths.length).toBeGreaterThan(0);
    icon.paths.forEach((d) => expect(d).toMatch(/^[Mm]/));
  });
});
