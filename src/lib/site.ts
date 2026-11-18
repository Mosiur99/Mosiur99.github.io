export const site = {
  name: 'Mosiur Zzaman',
  role: 'Backend Software Engineer',
  url: 'https://mosiur99.github.io',
} as const;

export function pageTitle(page?: string): string {
  const base = `${site.name} · ${site.role}`;
  return page ? `${page} · ${site.name}` : base;
}
