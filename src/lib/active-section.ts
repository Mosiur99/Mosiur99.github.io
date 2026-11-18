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
 * The page edges are special: at the top the first section wins, and at the bottom the last
 * one does, so short sections at either end can still become active.
 */
export function pickActiveSection(
  sections: SectionPosition[],
  { readingLine, atTop, atBottom }: ScrollState,
): string | undefined {
  if (sections.length === 0) return undefined;
  if (atTop) return sections[0]?.id;
  if (atBottom) return sections[sections.length - 1]?.id;
  let active = sections[0]?.id;
  for (const section of sections) {
    if (section.top <= readingLine) active = section.id;
  }
  return active;
}
