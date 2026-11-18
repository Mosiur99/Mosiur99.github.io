import { describe, expect, it } from 'vitest';
import { buildRatingChart, codeforcesRank, roundedLabel } from '../../src/lib/chart';

const point = (date: string, rating: number) => ({
  contestId: 1,
  contestName: 'Round',
  date: `${date}T00:00:00.000Z`,
  rating,
});

const points = [
  point('2019-04-16', 1367),
  point('2020-06-01', 1243),
  point('2022-03-10', 1434),
  point('2024-06-03', 1240),
];

const size = { width: 600, height: 240, padding: { top: 10, right: 10, bottom: 24, left: 40 } };

describe('codeforcesRank', () => {
  it.each([
    [1199, 'Newbie'],
    [1200, 'Pupil'],
    [1434, 'Specialist'],
    [1600, 'Expert'],
    [1950, 'Candidate Master'],
    [2150, 'Master'],
    [2500, 'Grandmaster'],
  ])('%i is %s', (rating, name) => {
    expect(codeforcesRank(rating).name).toBe(name);
  });
});

describe('roundedLabel', () => {
  it.each([
    [3336, '3,300+'],
    [3300, '3,300+'],
    [1933, '1,900+'],
    [99, '99'],
  ])('%i becomes %s', (value, label) => {
    expect(roundedLabel(value)).toBe(label);
  });
});

describe('buildRatingChart', () => {
  const chart = buildRatingChart(points, size);

  it('pads the rating range to whole hundreds', () => {
    expect(chart.domain).toEqual({ min: 1100, max: 1500 });
  });

  it('places the first and last points on the plot edges', () => {
    expect(chart.points[0]?.x).toBe(40);
    expect(chart.points.at(-1)?.x).toBe(590);
  });

  it('puts higher ratings higher on the chart', () => {
    const [first, second] = chart.points;
    expect(first && second && first.y < second.y).toBe(true);
    const top = 10;
    const bottom = 240 - 24;
    expect(chart.scaleY(1500)).toBe(top);
    expect(chart.scaleY(1100)).toBe(bottom);
  });

  it('spaces points by date, not by index', () => {
    const [a, b, c] = chart.points.map((p) => p.x);
    expect(a !== undefined && b !== undefined && c !== undefined).toBe(true);
    expect((c as number) - (b as number)).toBeGreaterThan((b as number) - (a as number));
  });

  it('marks the peak rating', () => {
    expect(chart.peak.rating).toBe(1434);
  });

  it('draws rank bands clipped to the visible range', () => {
    expect(chart.bands.map((band) => band.name)).toEqual(['Newbie', 'Pupil', 'Specialist']);
    const newbie = chart.bands[0];
    expect(newbie?.y).toBe(chart.scaleY(1200));
    expect((newbie?.y ?? 0) + (newbie?.height ?? 0)).toBe(chart.scaleY(1100));
  });

  it('labels every 200 points inside the range', () => {
    expect(chart.yTicks.map((tick) => tick.value)).toEqual([1200, 1400]);
    const wide = buildRatingChart([point('2020-01-01', 800), point('2021-01-01', 1450)], size);
    expect(wide.domain).toEqual({ min: 700, max: 1500 });
    expect(wide.yTicks.map((tick) => tick.value)).toEqual([800, 1000, 1200, 1400]);
  });

  it('labels years along the bottom', () => {
    expect(chart.xTicks.map((tick) => tick.label)).toEqual([
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
    ]);
  });

  it('builds a line path through every point', () => {
    expect(chart.line.startsWith('M40.0 ')).toBe(true);
    expect(chart.line.match(/L/g)).toHaveLength(points.length - 1);
  });

  it('handles a single contest', () => {
    const single = buildRatingChart([point('2024-01-01', 1500)], size);
    expect(single.points[0]?.x).toBe(315);
    expect(single.domain).toEqual({ min: 1400, max: 1600 });
  });
});

describe('buildRatingChart without contests', () => {
  it('explains that it needs data', () => {
    expect(() => buildRatingChart([], size)).toThrow('at least one contest');
  });
});
