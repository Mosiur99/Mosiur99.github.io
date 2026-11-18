import { describe, expect, it } from 'vitest';
import {
  achievementSchema,
  educationSchema,
  experienceSchema,
  judgeSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  type Project,
} from '../../src/content/schemas';
import { readFrontmatter, readYamlEntries } from './content-loader';

describe('content files', () => {
  it.each([
    ['profile.yaml', profileSchema],
    ['experience.yaml', experienceSchema],
    ['achievements.yaml', achievementSchema],
    ['judges.yaml', judgeSchema],
    ['skills.yaml', skillGroupSchema],
    ['education.yaml', educationSchema],
  ] as const)('%s matches its schema', (file, schema) => {
    const entries = readYamlEntries(file);
    expect(entries.length).toBeGreaterThan(0);
    for (const [id, data] of entries) {
      const result = schema.safeParse(data);
      expect(result.error?.issues, `${file} → ${id}`).toBeUndefined();
    }
  });

  it('every project matches the project schema', () => {
    for (const [file, data] of readFrontmatter('projects')) {
      const result = projectSchema.safeParse(data);
      expect(result.error?.issues, file).toBeUndefined();
    }
  });
});

describe('project rules', () => {
  const projects = readFrontmatter('projects').map(([, data]) => projectSchema.parse(data));

  it('has exactly one featured project', () => {
    expect(projects.filter((p: Project) => p.featured)).toHaveLength(1);
  });

  it('gives every project a unique order', () => {
    const orders = projects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('links every finished project to its source', () => {
    projects
      .filter((p) => p.status === 'complete')
      .forEach((p) => expect(p.links.length, p.title).toBeGreaterThan(0));
  });
});

describe('profile rules', () => {
  const [[, data]] = readYamlEntries('profile.yaml') as [[string, unknown]];
  const profile = profileSchema.parse(data);

  it('lists each social link once', () => {
    const kinds = profile.socials.map((s) => s.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it('uses https for every web link', () => {
    profile.socials
      .filter((s) => s.kind !== 'email')
      .forEach((s) => expect(s.url).toMatch(/^https:\/\//));
  });
});
