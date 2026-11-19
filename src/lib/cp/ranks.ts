import type { Judge } from '../../content/schemas';
import { codeforcesRank } from '../chart';

interface Band {
  min: number;
  title: string;
}

// CodeChef stars and AtCoder colours, highest band first.
const codechefStars: Band[] = [
  { min: 2500, title: '7★' },
  { min: 2200, title: '6★' },
  { min: 2000, title: '5★' },
  { min: 1800, title: '4★' },
  { min: 1600, title: '3★' },
  { min: 1400, title: '2★' },
  { min: 0, title: '1★' },
];

const atcoderColours: Band[] = [
  { min: 2800, title: 'Red' },
  { min: 2400, title: 'Orange' },
  { min: 2000, title: 'Yellow' },
  { min: 1600, title: 'Blue' },
  { min: 1200, title: 'Cyan' },
  { min: 800, title: 'Green' },
  { min: 400, title: 'Brown' },
  { min: 0, title: 'Grey' },
];

const band = (bands: Band[], rating: number) => bands.find((b) => rating >= b.min)?.title;

/** The title a platform gives for a rating, such as "Specialist" or "4★"; undefined if none. */
export function ratingTitle(platform: Judge['platform'], rating: number): string | undefined {
  switch (platform) {
    case 'codeforces':
      return codeforcesRank(rating).name;
    case 'codechef':
      return band(codechefStars, rating);
    case 'atcoder':
      return band(atcoderColours, rating);
    default:
      return undefined;
  }
}
