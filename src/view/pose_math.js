// Small interpolation helpers shared by the character sprites (story-008).

/** Linear interpolation between two numbers. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Linear interpolation between two {x, y} points. */
export function lerpPoint(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Smooth ease-in-out on [0, 1]. */
export function ease(t) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

/** Clamps t to [0, 1]. */
export function clamp01(t) {
  return Math.min(Math.max(t, 0), 1);
}

/**
 * Interpolates every key of two poses (objects of {x, y} points or numbers).
 * @param {object} from
 * @param {object} to
 * @param {number} t 0..1, eased by the caller if wanted.
 * @returns {object}
 */
export function blendPose(from, to, t) {
  const out = {};
  for (const key of Object.keys(from)) {
    const a = from[key];
    const b = to[key];
    out[key] = typeof a === 'number' ? lerp(a, b, t) : lerpPoint(a, b, t);
  }
  return out;
}
