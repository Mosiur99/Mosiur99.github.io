import { describe, expect, it } from 'vitest';
import {
  achievementSchema,
  experienceSchema,
  judgeSchema,
  postSchema,
  profileSchema,
  projectSchema,
} from '../../src/content/schemas';

const role = { title: 'Engineer', start: '2024-07', end: null };
const company = {
  company: 'Acme',
  url: 'https://example.com',
  industry: 'Retail',
  location: 'Dhaka',
  order: 1,
  roles: [role],
};

describe('experienceSchema', () => {
  it('accepts an open role', () => {
    expect(experienceSchema.safeParse(company).success).toBe(true);
  });

  it('rejects a role that ends before it starts', () => {
    const bad = { ...company, roles: [{ ...role, end: '2023-01' }] };
    const result = experienceSchema.safeParse(bad);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('A role cannot end before it starts');
  });

  it('rejects dates that are not YYYY-MM', () => {
    const bad = { ...company, roles: [{ ...role, start: 'July 2024' }] };
    expect(experienceSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects more than five bullets', () => {
    const bad = { ...company, roles: [{ ...role, bullets: Array(6).fill('Did a thing') }] };
    expect(experienceSchema.safeParse(bad).success).toBe(false);
  });
});

const project = { title: 'X', summary: 'A project', kind: 'system', year: 2026, order: 1 };

describe('projectSchema', () => {
  it('fills defaults', () => {
    const parsed = projectSchema.parse(project);
    expect(parsed.status).toBe('complete');
    expect(parsed.featured).toBe(false);
    expect(parsed.links).toEqual([]);
  });

  it('rejects an unknown kind', () => {
    expect(projectSchema.safeParse({ ...project, kind: 'game' }).success).toBe(false);
  });

  it('rejects a flow with a single step', () => {
    expect(projectSchema.safeParse({ ...project, flow: ['Client'] }).success).toBe(false);
  });

  it('rejects a link without a valid URL', () => {
    const bad = { ...project, links: [{ label: 'Code', url: 'github/x' }] };
    expect(projectSchema.safeParse(bad).success).toBe(false);
  });
});

describe('judgeSchema', () => {
  const judge = { platform: 'codechef', handle: 'me', url: 'https://www.codechef.com/users/me' };

  it('accepts an API platform without manual data', () => {
    expect(judgeSchema.safeParse({ ...judge, source: 'api' }).success).toBe(true);
  });

  it('requires manual data for manual platforms', () => {
    const result = judgeSchema.safeParse({ ...judge, source: 'manual' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['manual']);
  });

  it('accepts complete manual data', () => {
    const ok = { ...judge, source: 'manual', manual: { solved: 120, asOf: '2026-11' } };
    expect(judgeSchema.safeParse(ok).success).toBe(true);
  });
});

describe('achievementSchema', () => {
  it('rejects an end year before the start year', () => {
    const bad = { title: 'T', result: 'R', category: 'setting', year: 2024, endYear: 2020 };
    expect(achievementSchema.safeParse(bad).success).toBe(false);
  });
});

describe('postSchema', () => {
  it('turns date strings into dates and hides nothing by default', () => {
    const post = postSchema.parse({ title: 'Hello', description: 'Intro', date: '2026-11-18' });
    expect(post.date).toBeInstanceOf(Date);
    expect(post.draft).toBe(false);
  });

  it('rejects descriptions longer than a search snippet', () => {
    const bad = { title: 'Hello', description: 'x'.repeat(161), date: '2026-11-18' };
    expect(postSchema.safeParse(bad).success).toBe(false);
  });
});

describe('profile highlights', () => {
  const base = {
    name: 'N',
    role: 'R',
    lead: 'L',
    summary: ['S'],
    location: 'Dhaka',
    employer: { name: 'E', url: 'https://example.com' },
    availability: 'Open',
    contact: 'Email me',
    email: 'me@example.com',
    cvPath: '/cv.pdf',
    socials: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/x' }],
  };
  const fill = (h: object) => ({ ...base, highlights: [h, h, h, h] });

  it('accepts a fixed value or a stat', () => {
    expect(profileSchema.safeParse(fill({ label: 'A', value: '1' })).success).toBe(true);
    expect(profileSchema.safeParse(fill({ label: 'A', stat: 'problemsSolved' })).success).toBe(
      true,
    );
  });

  it('rejects a highlight with both or neither', () => {
    const both = fill({ label: 'A', value: '1', stat: 'problemsSolved' });
    expect(profileSchema.safeParse(both).success).toBe(false);
    expect(profileSchema.safeParse(fill({ label: 'A' })).success).toBe(false);
  });
});
