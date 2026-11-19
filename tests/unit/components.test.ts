import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Button from '../../src/components/Button.astro';
import Icon from '../../src/components/Icon.astro';
import SectionHeading from '../../src/components/SectionHeading.astro';
import Tag from '../../src/components/Tag.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('Button', () => {
  it('renders a link when given href', async () => {
    const html = await container.renderToString(Button, {
      props: { href: '/cv.pdf', variant: 'primary' },
      slots: { default: 'Download CV' },
    });
    expect(html).toMatch(/<a[^>]*href="\/cv\.pdf"/);
    expect(html).toContain('button--primary');
    expect(html).toContain('Download CV');
  });

  it('renders a button of type button by default', async () => {
    const html = await container.renderToString(Button, { slots: { default: 'Copy' } });
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toContain('button--secondary');
  });

  it('opens external links safely in a new tab', async () => {
    const html = await container.renderToString(Button, {
      props: { href: 'https://github.com/Mosiur99', external: true },
      slots: { default: 'GitHub' },
    });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('does not add target to internal links', async () => {
    const html = await container.renderToString(Button, {
      props: { href: '#contact' },
      slots: { default: 'Contact' },
    });
    expect(html).not.toContain('target=');
  });
});

describe('Icon', () => {
  it('is hidden from screen readers when decorative', async () => {
    const html = await container.renderToString(Icon, { props: { name: 'mail' } });
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });

  it('is announced when given a label', async () => {
    const html = await container.renderToString(Icon, {
      props: { name: 'github', label: 'GitHub' },
    });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="GitHub"');
    expect(html).not.toContain('aria-hidden');
  });

  it('fills brand icons and strokes line icons', async () => {
    const brand = await container.renderToString(Icon, { props: { name: 'github' } });
    const line = await container.renderToString(Icon, { props: { name: 'download' } });
    expect(brand).toContain('fill="currentColor"');
    expect(line).toContain('stroke="currentColor"');
  });
});

describe('Tag', () => {
  it('uses the neutral tone by default', async () => {
    const html = await container.renderToString(Tag, { slots: { default: 'Java' } });
    expect(html).toContain('tag--neutral');
    expect(html).toContain('Java');
  });
});

describe('SectionHeading', () => {
  it('renders an h2 with the given id', async () => {
    const html = await container.renderToString(SectionHeading, {
      props: { title: 'Projects', id: 'projects' },
    });
    expect(html).toMatch(/<h2[^>]*id="projects"[^>]*>Projects<\/h2>/);
    expect(html).not.toContain('class="aside"');
  });

  it('renders a subtitle under the title when given', async () => {
    const html = await container.renderToString(SectionHeading, {
      props: { title: 'Skills', subtitle: 'Tools I use' },
    });
    expect(html).toMatch(/<p class="subtitle"[^>]*>Tools I use<\/p>/);
  });

  it('renders the aside slot when given', async () => {
    const html = await container.renderToString(SectionHeading, {
      props: { title: 'Projects' },
      slots: { default: 'All repositories' },
    });
    expect(html).toContain('All repositories');
  });
});
