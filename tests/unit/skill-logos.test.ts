import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { skillLogo, skillLogos } from '../../src/lib/skill-logos';

describe('skill logos', () => {
  it.each(Object.entries(skillLogos))('%s points at a coloured SVG in public/', (skill) => {
    const path = `public${skillLogo(skill)}`;
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).toMatch(/^<svg fill="#[0-9A-F]{6}" /);
  });

  it('has no logo for skills without an official one', () => {
    expect(skillLogo('Transactional outbox')).toBeUndefined();
  });
});
