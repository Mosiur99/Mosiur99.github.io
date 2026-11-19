export interface Tilt {
  /** Rotation around the horizontal axis, in degrees. Positive tips the top edge away. */
  rotateX: number;
  /** Rotation around the vertical axis, in degrees. */
  rotateY: number;
  /** Pointer position inside the element, as percentages, for the light reflection. */
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Turns a pointer position over an element into a gentle 3D tilt: the side under the pointer
 * dips towards the viewer, up to `max` degrees at the edges.
 */
export function tiltFor(
  pointer: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  max = 5,
): Tilt {
  if (box.width <= 0 || box.height <= 0) return { rotateX: 0, rotateY: 0, x: 50, y: 50 };
  const px = clamp((pointer.x - box.left) / box.width, 0, 1);
  const py = clamp((pointer.y - box.top) / box.height, 0, 1);
  return {
    rotateX: round((0.5 - py) * 2 * max) || 0,
    rotateY: round((px - 0.5) * 2 * max) || 0,
    x: round(px * 100),
    y: round(py * 100),
  };
}

/** Delay for the n-th item of a group that appears together, capped so long lists stay quick. */
export function staggerDelay(index: number, step = 70, cap = 350): number {
  return Math.min(Math.max(index, 0) * step, cap);
}
