export const sections = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'cp', label: 'Problem solving' },
  { id: 'writing', label: 'Writing' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;

export type Section = (typeof sections)[number];

export function visibleSections({ hasPosts }: { hasPosts: boolean }): Section[] {
  return sections.filter((section) => hasPosts || section.id !== 'writing');
}
