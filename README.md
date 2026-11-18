# Mosiur Zzaman — Portfolio

[![CI](https://github.com/Mosiur99/Mosiur99.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/Mosiur99/Mosiur99.github.io/actions/workflows/ci.yml)

Personal portfolio of Mosiur Zzaman, backend software engineer (Java, Spring Boot).

Live site: https://mosiur99.github.io

## Stack

- [Astro](https://astro.build) with strict TypeScript, output as static HTML
- Vitest for unit tests, Playwright for end-to-end tests
- ESLint and Prettier
- GitHub Actions for CI, GitHub Pages for hosting

## Getting started

Requires Node 24 (see `.nvmrc`).

```sh
nvm use
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start the dev server                  |
| `npm run build`    | Build the static site into `dist/`    |
| `npm run preview`  | Serve the built site locally          |
| `npm run check`    | Type-check Astro and TypeScript files |
| `npm run lint`     | Run ESLint                            |
| `npm run format`   | Format all files with Prettier        |
| `npm test`         | Run unit tests                        |
| `npm run test:e2e` | Build, serve and run Playwright tests |

The first time you run end-to-end tests, install the browser with `npx playwright install chromium`.

## Project structure

```text
src/
  components/ reusable UI (Button, Tag, Icon, SectionHeading)
  layouts/    page shells
  lib/        shared TypeScript (site data, icons, helpers)
  pages/      routes (/styleguide shows every token and component)
  styles/     design tokens and global styles
public/       static files served as-is
tests/
  unit/       Vitest tests
  e2e/        Playwright tests
```
