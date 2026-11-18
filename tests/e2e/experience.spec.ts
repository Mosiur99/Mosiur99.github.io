import { expect, test } from '@playwright/test';
import data from '../../src/data/cp-stats.json' with { type: 'json' };

test.describe('about and experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the key numbers', async ({ page }) => {
    const about = page.locator('#about');
    const solved = `${(Math.floor(data.totalSolved / 100) * 100).toLocaleString('en-US')}+`;
    for (const value of ['2+ years', solved, '2×', '142']) {
      await expect(about.getByText(value, { exact: true })).toBeVisible();
    }
  });

  test('shows the roles newest first with dates', async ({ page }) => {
    const roles = page.locator('#experience .role h4');
    await expect(roles).toHaveText([
      'Junior Software Engineer, Backend',
      'Software Engineer Intern',
    ]);
    await expect(page.locator('#experience')).toContainText('Jul 2024 – Present');
  });

  test('links the company in a new tab', async ({ page }) => {
    const link = page.locator('#experience').getByRole('link', { name: 'Rokomari.com' });
    await expect(link).toHaveAttribute('href', 'https://www.rokomari.com');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('keeps the timeline inside the screen', async ({ page }) => {
    const box = await page.locator('#experience .roles').boundingBox();
    const width = page.viewportSize()?.width ?? 0;
    if (!box) throw new Error('timeline is not rendered');
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  });
});
