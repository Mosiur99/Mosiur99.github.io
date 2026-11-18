import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import About from '../../src/components/About.astro';
import Experience from '../../src/components/Experience.astro';
import Projects from '../../src/components/Projects.astro';
import Skills from '../../src/components/Skills.astro';
import {
  experienceSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
} from '../../src/content/schemas';
import { readFrontmatter, readYamlEntries } from './content-loader';

let container: AstroContainer;
const escape = (text: string) => text.replaceAll("'", '&#39;');
const [[, profileData]] = readYamlEntries('profile.yaml') as [[string, unknown]];
const profile = profileSchema.parse(profileData);
const companies = readYamlEntries('experience.yaml').map(([, data]) =>
  experienceSchema.parse(data),
);
const [rokomari] = companies;
if (!rokomari) throw new Error('experience.yaml needs at least one company');

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('About', () => {
  it('shows the lead, summary and all four highlights', async () => {
    const html = await container.renderToString(About, { props: { profile } });
    expect(html).toContain(escape(profile.lead));
    profile.summary.forEach((p) => expect(html).toContain(escape(p)));
    expect(html.match(/<dt/g)).toHaveLength(4);
    expect(html).toContain('3,500+');
  });
});

describe('Experience', () => {
  const today = new Date(2026, 10, 18);

  it('lists the current role before the internship', async () => {
    const html = await container.renderToString(Experience, { props: { companies, today } });
    const current = html.indexOf('Junior Software Engineer');
    const intern = html.indexOf('Software Engineer Intern');
    expect(current).toBeGreaterThan(-1);
    expect(current).toBeLessThan(intern);
  });

  it('shows formatted dates and the time at the company', async () => {
    const html = await container.renderToString(Experience, { props: { companies, today } });
    expect(html).toContain('Jul 2024 – Present');
    expect(html).toContain('Mar 2024 – Jun 2024');
    expect(html).toContain('2 yrs 9 mos');
  });

  it('marks only the open role as current', async () => {
    const html = await container.renderToString(Experience, { props: { companies, today } });
    expect(html.match(/class="role current/g)).toHaveLength(1);
  });

  it('orders companies by their order field', async () => {
    const older = { ...rokomari, company: 'Older Co', order: 2 };
    const html = await container.renderToString(Experience, {
      props: { companies: [older, rokomari], today },
    });
    expect(html.indexOf('Rokomari.com')).toBeLessThan(html.indexOf('Older Co'));
  });
});

describe('Projects', () => {
  const projects = readFrontmatter('projects').map(([, data]) => projectSchema.parse(data));
  const render = () =>
    container.renderToString(Projects, {
      props: { projects, allReposUrl: 'https://github.com/Mosiur99?tab=repositories' },
    });

  it('puts the featured project before the cards', async () => {
    const html = await render();
    expect(html.indexOf('Featured project')).toBeLessThan(html.indexOf('class="card"'));
    expect(html.match(/class="card"/g)).toHaveLength(projects.length - 1);
  });

  it('labels the request flow as an ordered list', async () => {
    const html = await render();
    expect(html).toMatch(/<ol aria-labelledby="featured-flow"/);
    expect(html.match(/class="step"/g)).toHaveLength(5);
  });

  it('shows status badges for unfinished projects', async () => {
    const html = await render();
    expect(html).toContain('Under review');
    expect(html).toContain('In progress');
  });

  it('names each link after its project for screen readers', async () => {
    const html = await render();
    expect(html).toContain('for PayLedger');
    expect(html).toContain('for Lettuce');
  });
});

describe('Skills', () => {
  it('lists the groups in order', async () => {
    const groups = readYamlEntries('skills.yaml').map(([, data]) => skillGroupSchema.parse(data));
    const html = await container.renderToString(Skills, {
      props: { groups: [...groups].reverse() },
    });
    const names = [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>/g)].map((m) => m[1]);
    expect(names).toEqual([...groups].sort((a, b) => a.order - b.order).map((g) => g.name));
  });
});
