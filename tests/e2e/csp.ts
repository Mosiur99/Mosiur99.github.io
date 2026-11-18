import type { Page } from '@playwright/test';

/** Records Content Security Policy violations so a test can assert there were none. */
export async function watchCsp(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { cspViolations: string[] }).cspViolations = seen;
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(`${event.violatedDirective}: ${event.blockedURI || 'inline'}`);
    });
  });
  return () =>
    page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);
}
