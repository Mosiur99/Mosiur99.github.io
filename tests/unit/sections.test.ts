import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Achievements from '../../src/components/Achievements.astro';
import Contact from '../../src/components/Contact.astro';
import Education from '../../src/components/Education.astro';
import Experience from '../../src/components/Experience.astro';
import Hero from '../../src/components/Hero.astro';
import ProblemSolving from '../../src/components/ProblemSolving.astro';
import Projects from '../../src/components/Projects.astro';
import Skills from '../../src/components/Skills.astro';
import Writing from '../../src/components/Writing.astro';
import {
  achievementSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
} from '../../src/content/schemas';
import type { CpStats } from '../../src/lib/cp/types';
import { readFrontmatter, readYamlEntries } from './content-loader';

let container: AstroContainer;
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

describe('Hero', () => {
  const render = () =>
    container.renderToString(Hero, { props: { profile, stats: { problemsSolved: '3,300+' } } });

  it('greets with the name as the only h1', async () => {
    const html = await render();
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.replace(/<!--.*?-->/g, '')).toMatch(/<h1[^>]*>Hi, I(&#39;|')m Mosiur Zzaman<\/h1>/);
  });

  it('shows the marked words of the introduction in bold, without the markers', async () => {
    const html = await render();
    expect(html).toMatch(/<b[^>]*>Rokomari\.com<\/b>/);
    expect(html).toMatch(/<b[^>]*>Spring Boot<\/b>/);
    expect(html).not.toContain('**');
  });

  it('shows all four highlights with the live problems-solved number', async () => {
    const html = await render();
    expect(html.match(/<li[^>]*><b[^>]*>/g)).toHaveLength(4);
    expect(html).toMatch(/<b[^>]*>3,300\+<\/b> problems solved/);
  });

  it('shows the photo, the CV link and every social link', async () => {
    const html = await render();
    expect(html).toContain('alt="Photo of Mosiur Zzaman"');
    expect(html).toContain(`href="${profile.cvPath}"`);
    profile.socials.forEach((s) => expect(html).toContain(`aria-label="${s.label}"`));
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

  it('shows the marked phrases of each bullet in bold', async () => {
    const html = await container.renderToString(Experience, { props: { companies, today } });
    expect(html).toMatch(/<b[^>]*>event-driven processing<\/b>/);
    expect(html).not.toContain('**');
  });

  it('shows the company logo when there is one, and the initial otherwise', async () => {
    const html = await container.renderToString(Experience, { props: { companies, today } });
    expect(html).toContain('src="/logos/rokomari.svg" alt="Rokomari.com logo"');
    const plain = { ...rokomari, logo: undefined };
    const fallback = await container.renderToString(Experience, {
      props: { companies: [plain], today },
    });
    expect(fallback).toMatch(/class="logo"[^>]*>\s*R\.\s*</);
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

  it('gives every project an icon and says when the code is not public', async () => {
    const html = await render();
    expect(html.match(/class="tile"/g)).toHaveLength(projects.length);
    const withoutLinks = projects.filter((p) => !p.featured && p.links.length === 0).length;
    expect(html.match(/Code not public yet/g) ?? []).toHaveLength(withoutLinks);
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
    const names = [...html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/g)].map((m) =>
      m[1]?.replace(/<[^>]+>/g, '').trim(),
    );
    expect(names).toEqual([...groups].sort((a, b) => a.order - b.order).map((g) => g.name));
  });

  it('shows each item as its own chip with a group icon', async () => {
    const groups = readYamlEntries('skills.yaml').map(([, data]) => skillGroupSchema.parse(data));
    const html = await container.renderToString(Skills, { props: { groups } });
    const items = groups.reduce((sum, g) => sum + g.items.length, 0);
    expect(html.match(/<li[^>]*>/g)).toHaveLength(items);
    expect(html.match(/<svg/g)).toHaveLength(groups.length);
  });
});

describe('ProblemSolving', () => {
  const asOf = '2026-11-18T12:00:00.000Z';
  const stats: CpStats = {
    fetchedAt: asOf,
    totalSolved: 2100,
    platforms: [
      {
        platform: 'leetcode',
        handle: 'mosiur',
        url: 'https://leetcode.com/u/mosiur/',
        solved: 300,
        source: 'cached',
        asOf: '2026-10-02T00:00:00.000Z',
      },
      {
        platform: 'codeforces',
        handle: 'mosiur_zaman',
        url: 'https://codeforces.com/profile/mosiur_zaman',
        solved: 1600,
        rating: 1240,
        maxRating: 1434,
        source: 'api',
        asOf,
      },
      {
        platform: 'timus',
        handle: '295370',
        url: 'https://acm.timus.ru/author.aspx?id=295370',
        solved: 200,
        source: 'manual',
        asOf: '2026-11-01T00:00:00.000Z',
      },
    ],
    codeforcesHistory: [
      { contestId: 1, contestName: 'Round A', date: '2020-01-01T00:00:00.000Z', rating: 1300 },
      { contestId: 2, contestName: 'Round B', date: '2022-01-01T00:00:00.000Z', rating: 1434 },
    ],
  };
  const render = () => container.renderToString(ProblemSolving, { props: { stats } });

  it('lists platforms by solved count with the total', async () => {
    const html = await render();
    const order = ['Codeforces', 'LeetCode', 'Timus'].map((name) => html.indexOf(`>${name}<`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html).toContain('2,100');
  });

  it('marks cached values and says which platforms update daily', async () => {
    const html = await render();
    expect(html).toContain('(cached)');
    expect(html).toContain('Codeforces update daily.');
    expect(html).toContain('LeetCode, Timus as of Oct 2026.');
  });

  it('describes the rating chart for screen readers', async () => {
    const html = await render();
    expect(html).toContain('Peak 1434 (Specialist) in Jan 2022');
    expect(html).toContain('<title id="rating-title">Codeforces rating history</title>');
  });

  it('shows a logo card for every judge, linked to the profile', async () => {
    const html = await render();
    for (const p of stats.platforms) {
      expect(html).toContain(`src="/judges/${p.platform}.`);
      expect(html).toContain(`href="${p.url}"`);
    }
  });

  it('lets long handles wrap only after an underscore', async () => {
    const html = await render();
    expect(html).toMatch(/mosiur_<wbr[^>]*>zaman/);
  });

  it('shows rating cards with the platform title and peak rating', async () => {
    const html = await render();
    expect(html.match(/class="rating surface"/g)).toHaveLength(1);
    expect(html).toMatch(/Specialist\s*<\/p>/);
    expect(html).toMatch(/<dd[^>]*>1434<\/dd>/);
    expect(html).toContain('View profile<span class="visually-hidden"');
  });
});

describe('Achievements', () => {
  const achievements = readYamlEntries('achievements.yaml').map(([, data]) =>
    achievementSchema.parse(data),
  );
  const render = () => container.renderToString(Achievements, { props: { achievements } });

  it('puts the featured ICPC results in one card with the ICPC logo and their ranks', async () => {
    const html = await render();
    expect(html).toContain('src="/logos/icpc.png" alt="ICPC logo"');
    const featured = achievements.filter((a) => a.featured);
    expect(featured.length).toBeGreaterThan(0);
    expect(html).toContain(`${featured.length}×`);
    const card = html.slice(html.indexOf('class="icpc'), html.indexOf('class="cards'));
    featured.forEach((a) => expect(card).toContain(`>${a.result}<`));
  });

  it('gives each result with a summary its own card', async () => {
    const html = await render();
    const withSummary = achievements.filter((a) => a.summary);
    expect(html.match(/class="card surface"/g)).toHaveLength(withSummary.length);
    withSummary.forEach((a) => expect(html).toContain(a.summary?.replaceAll("'", '&#39;')));
  });

  it('links the contests a card mentions', async () => {
    const html = await render();
    const setter = achievements.find((a) => a.links.length > 0);
    expect(setter).toBeDefined();
    setter?.links.forEach((link) => {
      expect(html).toContain(`href="${link.url}"`);
      expect(html).toContain(link.label);
    });
  });

  it('lists the remaining results in two columns', async () => {
    const html = await render();
    const rest = achievements.filter((a) => !a.featured && !a.summary);
    expect(html.match(/class="results"/g)).toHaveLength(2);
    expect(html.match(/class="year"/g)).toHaveLength(rest.length);
  });

  it('shows the newest results first, with month and rank', async () => {
    const html = await render();
    expect(html.indexOf('National Collegiate Programming Contest')).toBeLessThan(
      html.indexOf('UITS Ahmed Zobayer'),
    );
    expect(html).toContain('Mar 2024');
    expect(html).toContain('>155th<');
  });

  it('links standings pages in a new tab with a readable name', async () => {
    const html = await render();
    expect(html).toMatch(
      /href="https:\/\/toph\.co\/c\/cou-bracnet-inter-university-2023\/standings"[^>]*target="_blank"[^>]*>\s*Standings<span class="visually-hidden"[^>]*> for CoU-BRACNet/,
    );
  });

  it('names the team when it is known', async () => {
    const html = await render();
    expect(html).toContain('Team NSTU_SnackAttack');
    expect(html).toContain('Team LoadShedding');
  });
});

describe('Education', () => {
  it('shows the degree, institution link and years', async () => {
    const items = readYamlEntries('education.yaml').map(([, data]) => educationSchema.parse(data));
    const html = await container.renderToString(Education, { props: { items } });
    expect(html).toContain('B.Sc. in Computer Science and Telecommunication Engineering');
    expect(html).toMatch(/href="https:\/\/nstu\.edu\.bd"[^>]*target="_blank"/);
    expect(html).toContain('2019 – 2024');
    expect(html).toMatch(/class="logo"[^>]*>\s*NSTU\s*</);
  });
});

describe('Contact', () => {
  it('shows the email as text with copy, mail and LinkedIn actions', async () => {
    const html = await container.renderToString(Contact, { props: { profile } });
    expect(html).toContain(`>${profile.email}</code>`);
    expect(html).toContain('data-copy-email');
    expect(html).toContain(`href="mailto:${profile.email}"`);
    expect(html).toContain('linkedin.com/in/');
    expect(html).toContain('role="status"');
  });
});

describe('Writing', () => {
  it('shows the three newest posts', async () => {
    const post = (slug: string, date: string) => ({
      slug,
      title: `Post ${slug}`,
      description: 'About it',
      date: new Date(date),
    });
    const posts = [
      post('a', '2026-01-01'),
      post('d', '2026-04-01'),
      post('b', '2026-02-01'),
      post('c', '2026-03-01'),
    ];
    const html = await container.renderToString(Writing, { props: { posts } });
    const slugs = [...html.matchAll(/href="\/blog\/(\w)\/"/g)].map((m) => m[1]);
    expect(slugs).toEqual(['d', 'c', 'b']);
    expect(html).toContain('Apr 2026');
  });
});
