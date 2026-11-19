import { describe, expect, it } from 'vitest';
import { splitEmphasis } from '../../src/lib/emphasis';

describe('splitEmphasis', () => {
  it('marks text between double asterisks as bold', () => {
    expect(splitEmphasis('Engineer at **Rokomari.com**, using **Java**.')).toEqual([
      { text: 'Engineer at ', strong: false },
      { text: 'Rokomari.com', strong: true },
      { text: ', using ', strong: false },
      { text: 'Java', strong: true },
      { text: '.', strong: false },
    ]);
  });

  it('returns plain text unchanged', () => {
    expect(splitEmphasis('No markers')).toEqual([{ text: 'No markers', strong: false }]);
  });

  it('rejects an unclosed marker', () => {
    expect(() => splitEmphasis('Broken **bold')).toThrow('Unclosed **');
  });
});
