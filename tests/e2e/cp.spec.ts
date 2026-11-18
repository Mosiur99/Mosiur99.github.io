import { expect, test } from '@playwright/test';
import data from '../../src/data/cp-stats.json' with { type: 'json' };

test.describe('competitive programming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('adds up the solved table to the total', async ({ page }) => {
    const rows = page.locator('#cp .solved tbody td');
    const values = (await rows.allTextContents()).map((v) => Number(v.replaceAll(',', '')));
    expect(values).toHaveLength(data.platforms.length);
    const total = await page.locator('#cp .solved tfoot td').textContent();
    expect(Number(total?.replaceAll(',', ''))).toBe(values.reduce((a, b) => a + b, 0));
  });

  test('matches the problems-solved number in the About row', async ({ page }) => {
    const hundreds = Math.floor(data.totalSolved / 100) * 100;
    await expect(page.locator('#about')).toContainText(`${hundreds.toLocaleString('en-US')}+`);
  });

  test('draws an accessible rating chart with a table fallback', async ({ page }) => {
    const chart = page.getByRole('img', { name: 'Codeforces rating history' });
    await expect(chart).toBeVisible();
    await page.getByText('Show the rating history as a table').click();
    await expect(page.locator('#cp details tbody tr')).toHaveCount(data.codeforcesHistory.length);
  });

  test('links every judge profile in a new tab', async ({ page }) => {
    const links = page.locator('#cp .solved a');
    await expect(links).toHaveCount(data.platforms.length);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('lists contest results and roles', async ({ page }) => {
    await expect(page.locator('#cp .results li')).toHaveCount(7);
    await expect(page.locator('#cp .results')).toContainText('ICPC Asia Dhaka Regional');
  });
});
