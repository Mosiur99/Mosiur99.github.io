const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Span {
  start: string;
  end: string | null;
}

function parse(yearMonth: string): { year: number; month: number } {
  const [year, month] = yearMonth.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 1 };
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(yearMonth: string): string {
  const { year, month } = parse(yearMonth);
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
}

export function monthsInclusive(start: string, end: string | null, today = new Date()): number {
  const from = parse(start);
  const to = parse(end ?? toYearMonth(today));
  return (to.year - from.year) * 12 + (to.month - from.month) + 1;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ');
}

export function companySpan(roles: Span[]): Span {
  const start = roles.map((r) => r.start).sort()[0] ?? '';
  const open = roles.some((r) => r.end === null);
  const end = open
    ? null
    : (roles
        .map((r) => r.end as string)
        .sort()
        .at(-1) ?? null);
  return { start, end };
}

export function sortRolesNewestFirst<T extends Span>(roles: T[]): T[] {
  return [...roles].sort((a, b) => {
    if ((a.end === null) !== (b.end === null)) return a.end === null ? -1 : 1;
    return b.start.localeCompare(a.start);
  });
}
