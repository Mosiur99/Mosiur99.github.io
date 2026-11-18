import { describe, expect, it } from 'vitest';
import { sections, visibleSections } from '../../src/lib/sections';

describe('visibleSections', () => {
  it('hides Writing until there is a published post', () => {
    expect(visibleSections({ hasPosts: false }).map((s) => s.id)).not.toContain('writing');
  });

  it('shows every section once there are posts', () => {
    expect(visibleSections({ hasPosts: true })).toEqual(sections);
  });

  it('starts with About and ends with Contact', () => {
    const ids = visibleSections({ hasPosts: false }).map((s) => s.id);
    expect(ids[0]).toBe('about');
    expect(ids.at(-1)).toBe('contact');
  });
});
