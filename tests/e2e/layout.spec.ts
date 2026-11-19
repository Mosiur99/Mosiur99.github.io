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
  test.skip(({ isMobile }) => isMobile, 'The section list is hidden on phones');

  test('marks About as current on load', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true');
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

test.describe('sidebar', () => {
  test('offers the CV as a PDF', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.getByRole('link', { name: 'Download CV' }).getAttribute('href');
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

  test('shows the section list on desktop only', async ({ page, isMobile }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Sections' });
    if (isMobile) await expect(nav).toBeHidden();
    else await expect(nav).toBeVisible();
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

test.describe('short windows and larger text', () => {
  test.use({ viewport: { width: 1280, height: 560 } });

  test('keeps the photo square and lets the sidebar scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The sidebar is a header on phones');
    await page.goto('/');
    // Like a larger default font size in the browser settings (CSSOM changes are allowed by the CSP).
    await page.evaluate(() => (document.documentElement.style.fontSize = '125%'));
    const photo = await page.locator('.sidebar .photo').boundingBox();
    if (!photo) throw new Error('photo is not rendered');
    expect(photo.width).toBe(photo.height);
    const fits = await page
      .locator('.sidebar .inner')
      .evaluate(
        (el) => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto',
      );
    expect(fits).toBe(true);
  });
});

test.describe('responsive frame', () => {
  test('centres the page on a wide screen', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only');
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    const sidebar = await page.locator('.sidebar').boundingBox();
    const main = await page.locator('main').boundingBox();
    if (!sidebar || !main) throw new Error('layout is not rendered');
    const left = sidebar.x;
    const right = 1920 - (main.x + main.width);
    expect(Math.abs(left - right)).toBeLessThan(40);
    expect(main.width).toBeGreaterThan(800);
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
