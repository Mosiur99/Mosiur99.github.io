export interface SectionPosition {
  id: string;
  top: number;
}

export interface ScrollState {
  readingLine: number;
  atTop: boolean;
  atBottom: boolean;
}

/**
 * Picks the section the reader is on: the last one whose top has passed the reading line.
 * At the top of the page the reader is on the introduction, so no section is active. At the
 * bottom the last section wins, so a short final section can still become active.
 */
export function pickActiveSection(
  sections: SectionPosition[],
  { readingLine, atTop, atBottom }: ScrollState,
): string | undefined {
  if (sections.length === 0) return undefined;
  if (atTop) return undefined;
  if (atBottom) return sections[sections.length - 1]?.id;
  let active: string | undefined;
  for (const section of sections) {
    if (section.top <= readingLine) active = section.id;
  }
  return active;
}
