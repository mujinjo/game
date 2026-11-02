// Pure swing judgement (design/game-brief.md MVP 2, story-001-swipe-swing-batting).
// No DOM or Canvas: the result depends only on timing error, swing type and
// pitch height, plus the balance config.

/** Swing types chosen by swipe direction. */
export const SWING_TYPES = ['upper', 'level', 'down'];

/** Pitch heights, top to bottom. */
export const PITCH_HEIGHTS = ['high', 'middle', 'low'];

/** Every result the judge (or the view, for no_swing) can produce. */
export const RESULTS = ['whiff', 'foul', 'groundout', 'flyout', 'single', 'double', 'home_run', 'no_swing'];

const GRADES = ['perfect', 'good', 'ok', 'foul'];

/**
 * Grades a timing error against the config's windows.
 * @param {number} timingError Swing time minus ball arrival time, seconds (negative = early).
 * @param {object} windows config.timing_windows
 * @returns {string} 'perfect' | 'good' | 'ok' | 'foul' | 'miss'
 */
export function gradeTiming(timingError, windows) {
  const error = Math.abs(timingError);
  return GRADES.find((grade) => error <= windows[grade]) ?? 'miss';
}

/**
 * How far the swing is from the ideal swing for the pitch height:
 * 0 = ideal, 1 = one step off, 2 = opposite (high pitch with an upper swing, or
 * low pitch with a down swing).
 * @param {string} swingType
 * @param {string} pitchHeight
 * @param {object} idealSwing config.ideal_swing
 * @returns {number}
 */
export function swingMismatch(swingType, pitchHeight, idealSwing) {
  return Math.abs(SWING_TYPES.indexOf(swingType) - SWING_TYPES.indexOf(idealSwing[pitchHeight]));
}

/**
 * Judges one swing.
 * @param {{timingError: number, swingType: string, pitchHeight: string}} swing
 * @param {object} config Balance config.
 * @returns {string} One of RESULTS except 'no_swing' (the caller decides that).
 */
export function judgeSwing({ timingError, swingType, pitchHeight }, config) {
  const grade = gradeTiming(timingError, config.timing_windows);
  if (grade === 'miss') return 'whiff';

  const mismatch = swingMismatch(swingType, pitchHeight, config.ideal_swing);
  if (mismatch === 2) {
    return GRADES.indexOf(grade) <= GRADES.indexOf('good') ? 'foul' : 'whiff';
  }

  // One step off drops the timing grade by one.
  const adjusted = GRADES[GRADES.indexOf(grade) + mismatch] ?? 'miss';
  if (adjusted === 'miss') return 'whiff';
  if (adjusted === 'foul') return 'foul';
  return config.outcomes[swingType][adjusted];
}
