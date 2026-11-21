import type { IconName } from './icons';
import type { Project } from '../content/schemas';

const kindLabels: Record<Project['kind'], string> = {
  system: 'Backend system',
  'open-source': 'Open source',
  'web-app': 'Web app',
  'real-time': 'Real-time',
  ai: 'AI',
  extension: 'Chrome extension',
};

export const kindIcons: Record<Project['kind'], IconName> = {
  system: 'ledger',
  'open-source': 'pullRequest',
  'web-app': 'browser',
  'real-time': 'bolt',
  ai: 'sparkle',
  extension: 'browser',
};

const statusLabels: Record<Project['status'], string | null> = {
  complete: null,
  'in-progress': 'In progress',
  'under-review': 'Under review',
};

export function splitProjects(projects: Project[]): { featured: Project; others: Project[] } {
  const featured = projects.filter((p) => p.featured);
  const [main] = featured;
  if (featured.length !== 1 || !main) {
    throw new Error(`Expected exactly one featured project, found ${featured.length}`);
  }
  const others = projects.filter((p) => !p.featured).sort((a, b) => a.order - b.order);
  return { featured: main, others };
}

export function projectBadges(project: Project): string[] {
  const status = statusLabels[project.status];
  return status ? [kindLabels[project.kind], status] : [kindLabels[project.kind]];
}
