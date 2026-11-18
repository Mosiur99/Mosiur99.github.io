import { describe, expect, it } from 'vitest';
import { projectSchema, type Project } from '../../src/content/schemas';
import { projectBadges, splitProjects } from '../../src/lib/projects';

const make = (overrides: Partial<Project>): Project =>
  projectSchema.parse({
    title: 'P',
    summary: 'A project',
    kind: 'system',
    year: 2026,
    order: 1,
    ...overrides,
  });

describe('splitProjects', () => {
  it('separates the featured project and sorts the rest by order', () => {
    const { featured, others } = splitProjects([
      make({ title: 'C', order: 3 }),
      make({ title: 'Main', order: 1, featured: true }),
      make({ title: 'B', order: 2 }),
    ]);
    expect(featured.title).toBe('Main');
    expect(others.map((p) => p.title)).toEqual(['B', 'C']);
  });

  it('fails when no project is featured', () => {
    expect(() => splitProjects([make({ title: 'A' })])).toThrow('exactly one featured project');
  });

  it('fails when more than one project is featured', () => {
    const projects = [make({ featured: true }), make({ featured: true, order: 2 })];
    expect(() => splitProjects(projects)).toThrow('exactly one featured project');
  });
});

describe('projectBadges', () => {
  it('shows the kind for finished projects', () => {
    expect(projectBadges(make({ kind: 'real-time' }))).toEqual(['Real-time']);
  });

  it('adds the status when the project is not finished', () => {
    expect(projectBadges(make({ kind: 'open-source', status: 'under-review' }))).toEqual([
      'Open source',
      'Under review',
    ]);
    expect(projectBadges(make({ kind: 'ai', status: 'in-progress' }))).toEqual([
      'AI',
      'In progress',
    ]);
  });
});
