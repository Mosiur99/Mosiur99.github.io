import { describe, expect, it } from 'vitest';
import { staggerDelay, tiltFor } from '../../src/lib/motion';

const box = { left: 100, top: 200, width: 400, height: 200 };

describe('tiltFor', () => {
  it('stays flat with the pointer in the centre', () => {
    expect(tiltFor({ x: 300, y: 300 }, box)).toEqual({ rotateX: 0, rotateY: 0, x: 50, y: 50 });
  });

  it('reaches the maximum angle at the corners', () => {
    expect(tiltFor({ x: 100, y: 200 }, box, 6)).toEqual({ rotateX: 6, rotateY: -6, x: 0, y: 0 });
    expect(tiltFor({ x: 500, y: 400 }, box, 6)).toEqual({
      rotateX: -6,
      rotateY: 6,
      x: 100,
      y: 100,
    });
  });

  it('never goes past the maximum when the pointer leaves the element', () => {
    const tilt = tiltFor({ x: 9000, y: -50 }, box, 5);
    expect(tilt.rotateY).toBe(5);
    expect(tilt.rotateX).toBe(5);
  });

  it('stays flat for an element with no size', () => {
    expect(tiltFor({ x: 1, y: 1 }, { left: 0, top: 0, width: 0, height: 0 }).rotateX).toBe(0);
  });
});

describe('staggerDelay', () => {
  it('spaces items out and caps long lists', () => {
    expect([0, 1, 2].map((i) => staggerDelay(i))).toEqual([0, 70, 140]);
    expect(staggerDelay(20)).toBe(350);
    expect(staggerDelay(-1)).toBe(0);
  });
});
