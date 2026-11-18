import { expect, test } from '@playwright/test';

test.describe('projects and skills', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('features PayLedger with its request flow', async ({ page }) => {
    const featured = page.locator('#projects .featured');
    await expect(featured.getByRole('heading', { level: 3 })).toHaveText('PayLedger');
    const flow = featured.getByRole('list', { name: 'Request flow' });
    await expect(flow.getByRole('listitem')).toHaveCount(5);
  });

  test('shows the other projects in order with their badges', async ({ page }) => {
    const titles = page.locator('#projects .card h3');
    await expect(titles).toHaveText([
      'Lettuce',
      'MarketPulse',
      'Real-Time Score Broadcaster',
      'SmartTour',
    ]);
    const lettuce = page.locator('#projects .card', { hasText: 'Lettuce' });
    await expect(lettuce).toContainText('Under review');
  });

  test('opens project links safely in a new tab', async ({ page }) => {
    const links = page.locator('#projects .project-links a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
      await expect(links.nth(i)).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await expect(page.getByRole('link', { name: 'Source code for PayLedger' })).toHaveAttribute(
      'href',
      'https://github.com/Mosiur99/payledger',
    );
  });

  test('stacks the project cards on phones', async ({ page, isMobile }) => {
    const cards = page.locator('#projects .card');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    if (!first || !second) throw new Error('project cards are not rendered');
    if (isMobile) expect(second.y).toBeGreaterThan(first.y + first.height - 1);
    else expect(second.y).toBeCloseTo(first.y, 0);
  });

  test('lists six skill groups', async ({ page }) => {
    await expect(page.locator('#skills dt')).toHaveText([
      'Languages',
      'Backend',
      'Data stores',
      'Messaging',
      'Cloud and DevOps',
      'Testing',
    ]);
  });
});
