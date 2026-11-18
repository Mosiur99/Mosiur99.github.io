// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mosiur99.github.io',
  outDir: process.env.SHOW_DRAFTS === 'true' ? './dist-drafts' : './dist',
});
