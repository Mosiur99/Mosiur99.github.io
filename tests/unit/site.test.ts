import { describe, expect, it } from 'vitest';
import { pageTitle, site } from '../../src/lib/site';

describe('pageTitle', () => {
  it('uses name and role for the home page', () => {
    expect(pageTitle()).toBe('Mosiur Zzaman · Backend Software Engineer');
  });

  it('puts the page name before the site name', () => {
    expect(pageTitle('Blog')).toBe('Blog · Mosiur Zzaman');
  });
});

describe('site', () => {
  it('points at the GitHub Pages address', () => {
    expect(site.url).toBe('https://mosiur99.github.io');
  });
});
