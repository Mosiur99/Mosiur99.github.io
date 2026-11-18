// @ts-check
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

const showDrafts = process.env.SHOW_DRAFTS === 'true';

const hasPublishedPosts = readdirSync('src/content/blog')
  .filter((file) => file.endsWith('.md'))
  .some((file) => !/^draft:\s*true\s*$/m.test(readFileSync(`src/content/blog/${file}`, 'utf8')));

const hiddenPages = ['/styleguide/', ...(hasPublishedPosts ? [] : ['/blog/'])];

export default defineConfig({
  site: 'https://mosiur99.github.io',
  outDir: showDrafts ? './dist-drafts' : './dist',
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
  markdown: { syntaxHighlight: 'prism' },
  integrations: [sitemap({ filter: (page) => !hiddenPages.some((path) => page.endsWith(path)) })],
});
