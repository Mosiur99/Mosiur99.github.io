// Renders the favicon PNGs and the social preview image with Playwright.
// Run with `npm run images` after changing the name, role or design tokens.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const font = (weight) => {
  const file = `node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-${weight}-normal.woff2`;
  return `data:font/woff2;base64,${readFileSync(file).toString('base64')}`;
};

const fonts = `
  @font-face { font-family: Plex; font-weight: 500; src: url(${font(500)}); }
  @font-face { font-family: Plex; font-weight: 700; src: url(${font(700)}); }
  * { margin: 0; box-sizing: border-box; }
  body { font-family: Plex, sans-serif; }
`;

const icon = (size) => `
  <style>${fonts}
    body { width: ${size}px; height: ${size}px; display: grid; place-items: center;
      background: #0f1b2d; }
    span { color: #fff; font-weight: 700; font-size: ${Math.round(size * 0.42)}px; letter-spacing: -0.03em; }
  </style><span>MZ</span>`;

const og = `
  <style>${fonts}
    body { width: 1200px; height: 630px; padding: 80px 88px; background: #fff; color: #0f1b2d;
      display: flex; flex-direction: column; justify-content: space-between; border-bottom: 14px solid #1d4ed8; }
    .mark { width: 72px; height: 72px; border-radius: 16px; background: #0f1b2d; color: #fff;
      display: grid; place-items: center; font-weight: 700; font-size: 30px; }
    h1 { font-size: 76px; font-weight: 700; letter-spacing: -0.02em; margin-top: 40px; }
    .role { font-size: 36px; font-weight: 500; color: #2b3442; margin-top: 10px; }
    .facts { font-size: 26px; color: #5f6b7a; margin-top: 28px; }
    .url { font-size: 26px; font-weight: 500; color: #1d4ed8; }
  </style>
  <div>
    <div class="mark">MZ</div>
    <h1>Mosiur Zzaman</h1>
    <p class="role">Backend Software Engineer · Java, Spring Boot</p>
    <p class="facts">Event-driven systems · Payments · 3,300+ algorithm problems solved</p>
  </div>
  <p class="url">mosiur99.github.io</p>`;

const browser = await chromium.launch();
async function render(html, width, height, path) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path });
  await page.close();
}

await render(icon(180), 180, 180, 'public/apple-touch-icon.png');
await render(og, 1200, 630, 'public/og.png');
await browser.close();

writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f1b2d"/><text x="32" y="42" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="27" letter-spacing="-0.8" fill="#fff">MZ</text></svg>\n`,
);
console.log('Wrote public/apple-touch-icon.png, public/og.png and public/favicon.svg');
