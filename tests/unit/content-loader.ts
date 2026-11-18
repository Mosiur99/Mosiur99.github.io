import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const contentDir = join(import.meta.dirname, '../../src/content');

export function readYamlEntries(fileName: string): [string, unknown][] {
  const data = parse(readFileSync(join(contentDir, fileName), 'utf8')) as Record<string, unknown>;
  return Object.entries(data);
}

export function readFrontmatter(dir: string): [string, unknown][] {
  const folder = join(contentDir, dir);
  return readdirSync(folder)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(folder, name), 'utf8'));
      if (!match?.[1]) throw new Error(`${name} has no frontmatter`);
      return [name, parse(match[1])];
    });
}
