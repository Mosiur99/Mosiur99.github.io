export const site = {
  name: 'Mosiur Zzaman',
  role: 'Backend Software Engineer',
  url: 'https://mosiur99.github.io',
  description:
    'Mosiur Zzaman is a backend software engineer in Dhaka building reliable Java and Spring Boot services, with a competitive programming background.',
} as const;

export function pageTitle(page?: string): string {
  const base = `${site.name} · ${site.role}`;
  return page ? `${page} · ${site.name}` : base;
}
