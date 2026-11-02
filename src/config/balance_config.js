// Loads and checks the balance data file (design/game-brief.md MVP 7,
// story-001-swipe-swing-batting). Gameplay code reads every tuning value from
// the object this returns; nothing is hardcoded in the game modules.

/** Path of the default balance file, relative to index.html. */
export const DEFAULT_CONFIG_PATH = 'assets/data/balance_default.json';

const REQUIRED_SECTIONS = ['pitch', 'timing_windows', 'swipe', 'ideal_swing', 'outcomes', 'layout'];

/**
 * Fetches the balance JSON and checks that every section the game reads exists.
 * @param {string} [path] URL of the balance file.
 * @returns {Promise<object>} The parsed config.
 */
export async function loadBalanceConfig(path = DEFAULT_CONFIG_PATH) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Balance file ${path} could not be loaded (HTTP ${response.status}).`);
  }
  return validateBalanceConfig(await response.json());
}

/**
 * Throws if a section the game reads is missing; returns the config unchanged.
 * @param {object} config Parsed balance data.
 * @returns {object}
 */
export function validateBalanceConfig(config) {
  const missing = REQUIRED_SECTIONS.filter((key) => !(key in config));
  if (missing.length > 0) {
    throw new Error(`Balance file is missing: ${missing.join(', ')}`);
  }
  return config;
}
