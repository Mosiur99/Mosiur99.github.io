import type { RatingPoint } from './cp/types';

export interface Rank {
  name: string;
  slug: string;
  min: number;
  max: number;
  color: string;
}

const topRank: Rank = {
  name: 'Grandmaster',
  slug: 'gm',
  min: 2400,
  max: 5000,
  color: 'var(--rank-gm)',
};

export const codeforcesRanks: Rank[] = [
  { name: 'Newbie', slug: 'newbie', min: 0, max: 1200, color: 'var(--rank-newbie)' },
  { name: 'Pupil', slug: 'pupil', min: 1200, max: 1400, color: 'var(--rank-pupil)' },
  { name: 'Specialist', slug: 'specialist', min: 1400, max: 1600, color: 'var(--rank-specialist)' },
  { name: 'Expert', slug: 'expert', min: 1600, max: 1900, color: 'var(--rank-expert)' },
  { name: 'Candidate Master', slug: 'cm', min: 1900, max: 2100, color: 'var(--rank-cm)' },
  { name: 'Master', slug: 'master', min: 2100, max: 2400, color: 'var(--rank-master)' },
  topRank,
];

export function codeforcesRank(rating: number): Rank {
  return codeforcesRanks.find((r) => rating >= r.min && rating < r.max) ?? topRank;
}

export function roundedLabel(value: number): string {
  if (value < 100) return String(value);
  return `${(Math.floor(value / 100) * 100).toLocaleString('en-US')}+`;
}

interface Size {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export interface ChartPoint extends RatingPoint {
  x: number;
  y: number;
}

export function buildRatingChart(history: RatingPoint[], { width, height, padding }: Size) {
  if (history.length === 0) throw new Error('A rating chart needs at least one contest');
  const ratings = history.map((p) => p.rating);
  const domain = {
    min: Math.floor((Math.min(...ratings) - 50) / 100) * 100,
    max: Math.ceil((Math.max(...ratings) + 50) / 100) * 100,
  };
  const times = history.map((p) => Date.parse(p.date));
  const first = Math.min(...times);
  const last = Math.max(...times);
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;

  const scaleX = (time: number) =>
    last === first ? (left + right) / 2 : left + ((time - first) / (last - first)) * (right - left);
  const scaleY = (rating: number) =>
    top + ((domain.max - rating) / (domain.max - domain.min)) * (bottom - top);

  const points: ChartPoint[] = history.map((p) => ({
    ...p,
    x: scaleX(Date.parse(p.date)),
    y: scaleY(p.rating),
  }));
  const line = points
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${right.toFixed(1)} ${bottom} L${left.toFixed(1)} ${bottom} Z`;
  const peak = points.reduce((best, p) => (p.rating > best.rating ? p : best));

  const bands = codeforcesRanks
    .filter((r) => r.max > domain.min && r.min < domain.max)
    .map((r) => {
      const y = scaleY(Math.min(r.max, domain.max));
      return { name: r.name, color: r.color, y, height: scaleY(Math.max(r.min, domain.min)) - y };
    });

  const yTicks = [];
  for (let value = Math.ceil((domain.min + 1) / 200) * 200; value < domain.max; value += 200) {
    yTicks.push({ value, y: scaleY(value) });
  }

  const firstYear = new Date(first).getUTCFullYear() + 1;
  const lastYear = new Date(last).getUTCFullYear();
  const xTicks = [];
  for (let year = firstYear; year <= lastYear; year++) {
    xTicks.push({ label: String(year), x: scaleX(Date.UTC(year, 0, 1)) });
  }

  return { domain, points, line, area, peak, bands, yTicks, xTicks, scaleY, bottom, left, right };
}
