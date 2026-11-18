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
  components/ UI pieces (Sidebar, SectionNav, ThemeToggle, Button, Tag, Icon, ...)
  content/    site content (YAML and Markdown) and its Zod schemas
  layouts/    page shells (Base: head and SEO, Home: sidebar + content column)
  lib/        shared TypeScript (site data, icons, helpers)
  pages/      routes (/styleguide shows every token and component)
  styles/     design tokens and global styles
public/       static files served as-is
tests/
  unit/       Vitest tests
  e2e/        Playwright tests
```

## Editing content

All text on the site lives in `src/content/`:

| File                | Content                                     |
| ------------------- | ------------------------------------------- |
| `profile.yaml`      | Name, intro, location, links, key numbers   |
| `experience.yaml`   | Companies and roles (dates as `YYYY-MM`)    |
| `projects/*.md`     | One file per project; one may be `featured` |
| `skills.yaml`       | Skill groups                                |
| `achievements.yaml` | Contest results, problem setting, mentoring |
| `judges.yaml`       | Competitive programming profiles            |

Each file is checked against the schemas in `src/content/schemas.ts`. A missing field or a
wrong date stops the build with a message naming the file and the field.

## Competitive programming stats

`npm run fetch-stats` reads the profiles in `src/content/judges.yaml` and writes
`src/data/cp-stats.json`. The file is committed, so the site always builds with data.

| Judge                          | Source                                          |
| ------------------------------ | ----------------------------------------------- |
| Codeforces                     | Official API (rating, history, solved count)    |
| AtCoder                        | AtCoder Problems API and AtCoder rating history |
| LeetCode                       | Public GraphQL endpoint                         |
| UVa                            | uHunt API                                       |
| CodeChef, SPOJ, LightOJ, Timus | Manual numbers in `judges.yaml`                 |

The "problems solved" number in the About section is calculated from the same file.

If a platform fails (timeout, error, unexpected response), the last saved value is kept and
marked `cached`; a platform is never shown as zero. Platforms without an API can be added to
`judges.yaml` with `source: manual` and their numbers.

## Writing a blog post

1. Add `src/content/blog/my-post.md` with `title`, `description` (up to 160 characters),
   `date`, `tags` and `draft: true`.
2. Preview it with `npm run dev` or `npm run preview:drafts` (port 4322). Drafts show a Draft
   badge and are hidden from search engines.
3. Set `draft: false`, commit and push. The post, the home page Writing list and `/rss.xml`
   update on the next deploy.

The Writing section on the home page appears automatically once at least one post is published.
