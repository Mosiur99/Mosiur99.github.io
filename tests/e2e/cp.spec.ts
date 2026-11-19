import { expect, test } from '@playwright/test';
import data from '../../src/data/cp-stats.json' with { type: 'json' };

test.describe('problem solving and achievements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('adds up the judge cards to the total', async ({ page }) => {
    const counts = page.locator('#problem-solving .judge .count b');
    const values = (await counts.allTextContents()).map((v) => Number(v.replaceAll(',', '')));
    expect(values).toHaveLength(data.platforms.length);
    const total = await page.locator('#problem-solving .total .number').textContent();
    expect(Number(total?.replaceAll(',', ''))).toBe(values.reduce((a, b) => a + b, 0));
  });

  test('shows full handles and rating names with a larger browser font', async ({ page }) => {
    await page.evaluate(() => (document.documentElement.style.fontSize = '125%'));
    for (const handle of await page.locator('#problem-solving .judge .handle').all()) {
      const clipped = await handle.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(clipped).toBe(false);
    }
    for (const title of await page.locator('#problem-solving .rating .title').all()) {
      const clipped = await title.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(clipped).toBe(false);
    }
  });

  test('shows a loaded logo on every judge card', async ({ page }) => {
    const logos = page.locator('#problem-solving .judge img');
    await expect(logos).toHaveCount(data.platforms.length);
    for (const logo of await logos.all()) {
      await logo.scrollIntoViewIfNeeded();
      await expect
        .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test('matches the problems-solved number in the About row', async ({ page }) => {
    const hundreds = Math.floor(data.totalSolved / 100) * 100;
    await expect(page.locator('#about')).toContainText(`${hundreds.toLocaleString('en-US')}+`);
  });

  test('draws an accessible rating chart with a table fallback', async ({ page }) => {
    const chart = page.getByRole('img', { name: 'Codeforces rating history' });
    await expect(chart).toBeVisible();
    await page.getByText('Show the rating history as a table').click();
    await expect(page.locator('#problem-solving details tbody tr')).toHaveCount(
      data.codeforcesHistory.length,
    );
  });

  test('links every judge profile in a new tab', async ({ page }) => {
    const links = page.locator('#problem-solving a.judge');
    await expect(links).toHaveCount(data.platforms.length);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('lists contest results with ranks and standings links', async ({ page }) => {
    const section = page.locator('#achievements');
    await expect(section.locator('.icpc .rows li')).toHaveCount(2);
    await expect(section.locator('.card')).toHaveCount(4);
    await expect(section.locator('.results li')).toHaveCount(14);
    await expect(section).toContainText('Team NSTU_SnackAttack');
    const standings = section.locator('a.standings');
    await expect(standings).toHaveCount(6);
    for (const link of await standings.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('shows the ICPC logo on the ICPC card', async ({ page }) => {
    const logo = page.locator('#achievements').getByRole('img', { name: 'ICPC logo' });
    await logo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });

  test('shows a rating card for each judge with rating tiers', async ({ page }) => {
    const cards = page.locator('#problem-solving .rating');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText('Specialist');
  });
});
