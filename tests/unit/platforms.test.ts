import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { judgePlatforms } from '../../src/content/schemas';
import { platformLogos, platformNames } from '../../src/lib/cp/platforms';

describe('judge platforms', () => {
  it.each(judgePlatforms)('%s has a name and a logo file in public/', (platform) => {
    expect(platformNames[platform]).toBeTruthy();
    const logo = platformLogos[platform];
    expect(logo).toMatch(/^\/judges\/.+\.(svg|png)$/);
    expect(existsSync(`public${logo}`)).toBe(true);
  });
});
