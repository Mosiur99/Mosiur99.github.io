import { describe, expect, it } from 'vitest';
import { icons } from '../../src/lib/icons';
import { isExternal, socialIcons } from '../../src/lib/socials';
import { socialKinds } from '../../src/content/schemas';

describe('socialIcons', () => {
  it.each(socialKinds)('has an existing icon for %s', (kind) => {
    expect(icons[socialIcons[kind]]).toBeDefined();
  });
});

describe('isExternal', () => {
  it('treats http and https links as external', () => {
    expect(isExternal('https://github.com/Mosiur99')).toBe(true);
    expect(isExternal('http://example.com')).toBe(true);
  });

  it('treats mail and in-page links as internal', () => {
    expect(isExternal('mailto:someone@example.com')).toBe(false);
    expect(isExternal('#contact')).toBe(false);
    expect(isExternal('/Mosiur_Zzaman_CV.pdf')).toBe(false);
  });
});
