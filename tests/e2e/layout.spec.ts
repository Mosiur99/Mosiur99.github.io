import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('theme', () => {
  test('follows the system theme when nothing is saved', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  });

  test('remembers the chosen theme after a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  });

  test('applies the saved theme before any stylesheet loads', async ({ page }) => {
    await page.goto('/');
    const order = await page.evaluate(() => {
      const nodes = [...document.head.children];
      const script = nodes.findIndex(
        (n) => n.tagName === 'SCRIPT' && n.textContent?.includes('theme'),
      );
      const style = nodes.findIndex((n) => n.matches('link[rel="stylesheet"], style'));
      return { script, style };
    });
    expect(order.script).toBeGreaterThanOrEqual(0);
    expect(order.script).toBeLessThan(order.style);
  });
});

test.describe('section navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'Phones open the list from the menu button');

  test('marks no section while the introduction is in view', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await expect(nav.locator('[aria-current]')).toHaveCount(0);
  });

  test('scrolls to a section and marks it as current', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await nav.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('#projects')).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('marks the last section at the bottom of the page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

test.describe('top bar and introduction', () => {
  test('offers the CV as a PDF', async ({ page, request }) => {
    await page.goto('/');
    const href = await page
      .getByRole('link', { name: 'Download CV', exact: true })
      .getAttribute('href');
    expect(href).toBe('/Mosiur_Zzaman_CV.pdf');
    const response = await request.get('/Mosiur_Zzaman_CV.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('opens social profiles in a new tab and email in the mail app', async ({ page }) => {
    await page.goto('/');
    const github = page.getByRole('link', { name: 'GitHub', exact: true });
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    const email = page.getByRole('link', { name: 'Email', exact: true });
    await expect(email).toHaveAttribute('href', /^mailto:/);
    await expect(email).not.toHaveAttribute('target');
  });

  test('shows the section list, behind a menu button on phones', async ({ page, isMobile }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });
    if (!isMobile) {
      await expect(nav).toBeVisible();
      return;
    }
    await expect(nav).toBeHidden();
    const menu = page.getByRole('button', { name: 'Open the section menu' });
    await menu.click();
    await expect(nav).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close the section menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await nav.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(nav).toBeHidden();
  });

  test('keeps the top bar on screen while scrolling', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    const bar = await page.locator('.top-nav').boundingBox();
    if (!bar) throw new Error('top bar is not rendered');
    expect(bar.y).toBeGreaterThanOrEqual(0);
    expect(bar.y).toBeLessThan(40);
  });
});

test.describe('page basics', () => {
  test('has search and sharing metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /backend/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://mosiur99.github.io/',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Mosiur Zzaman · Backend Software Engineer',
    );
  });

  test('lets keyboard users skip to the content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Phones have no Tab key');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no accessibility violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('larger text', () => {
  test('keeps the photo round and the top bar on one line', async ({ page, isMobile }) => {
    await page.goto('/');
    // Like a larger default font size in the browser settings (CSSOM changes are allowed by the CSP).
    await page.evaluate(() => (document.documentElement.style.fontSize = '125%'));
    const photo = await page.locator('.hero .photo').boundingBox();
    if (!photo) throw new Error('photo is not rendered');
    expect(Math.abs(photo.width - photo.height)).toBeLessThan(1);
    const bar = await page.locator('.top-nav .bar').boundingBox();
    if (!bar) throw new Error('top bar is not rendered');
    expect(bar.height).toBeLessThan(isMobile ? 80 : 90);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('never cuts off a heading or label', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => (document.documentElement.style.fontSize = '125%'));
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('main :is(h1, h2, h3, h4, dd, .rank, .title, .handle)')]
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent?.trim()),
    );
    expect(clipped).toEqual([]);
  });
});

test.describe('responsive frame', () => {
  test('centres the page on a wide screen', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only');
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    const main = await page.locator('main').boundingBox();
    if (!main) throw new Error('layout is not rendered');
    const left = main.x;
    const right = 1920 - (main.x + main.width);
    expect(Math.abs(left - right)).toBeLessThan(2);
    expect(main.width).toBeGreaterThan(1000);
  });

  for (const width of [360, 820, 1280]) {
    test(`never scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  test('shows the profile photo', async ({ page }) => {
    await page.goto('/');
    const photo = page.getByRole('img', { name: 'Photo of Mosiur Zzaman' });
    await expect(photo).toBeVisible();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });
});
