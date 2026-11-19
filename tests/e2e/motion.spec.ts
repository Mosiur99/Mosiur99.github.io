import { expect, test } from '@playwright/test';

test.describe('motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('shows sections as they scroll into view, and every one ends up visible', async ({
    page,
  }) => {
    await page.goto('/');
    const group = page.locator('#skills .group').first();
    await expect(group).toHaveClass(/reveal/);
    expect(await group.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    });
    await expect(group).toHaveCSS('opacity', '1');
    await expect(page.locator('.reveal:not(.in)')).toHaveCount(0);
  });

  test('tilts a project card under the pointer and settles when it leaves', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Tilt needs a mouse');
    await page.goto('/');
    const card = page.locator('#projects .card').first();
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    if (!box) throw new Error('card is not rendered');
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
    await expect
      .poll(() => card.evaluate((el) => (el as HTMLElement).style.transform))
      .toContain('rotateX');
    await page.mouse.move(5, 5);
    await expect.poll(() => card.evaluate((el) => (el as HTMLElement).style.transform)).toBe('');
  });

  test('deepens the top bar shadow after scrolling', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('[data-top-nav]');
    await expect(nav).not.toHaveAttribute('data-scrolled');
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(nav).toHaveAttribute('data-scrolled');
  });
});

test.describe('reduced motion', () => {
  test('keeps everything still and visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/motion/);
    await expect(page.locator('.reveal')).toHaveCount(0);
    await expect(page.locator('#skills .group').first()).toHaveCSS('opacity', '1');
  });
});
