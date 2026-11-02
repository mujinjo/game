// Unit tests for swing judgement and swipe classification
// (story-001-swipe-swing-batting). Uses the real balance file so the tests
// follow tuning changes; boundary cases read their numbers from it too.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { judgeSwing, gradeTiming, swingMismatch } from '../../../src/batting/swing_judge.js';
import { classifySwipe } from '../../../src/batting/swipe_input.js';

const config = JSON.parse(readFileSync(new URL('../../../assets/data/balance_default.json', import.meta.url)));
const windows = config.timing_windows;

test('gradeTiming picks the best window the error fits, early or late', () => {
  assert.equal(gradeTiming(0, windows), 'perfect');
  assert.equal(gradeTiming(-windows.perfect, windows), 'perfect');
  assert.equal(gradeTiming(windows.good, windows), 'good');
  assert.equal(gradeTiming(windows.foul, windows), 'foul');
  assert.equal(gradeTiming(windows.foul + 0.001, windows), 'miss');
});

test('swingMismatch: ideal pairs are 0, opposites are 2', () => {
  assert.equal(swingMismatch('upper', 'low', config.ideal_swing), 0);
  assert.equal(swingMismatch('level', 'middle', config.ideal_swing), 0);
  assert.equal(swingMismatch('down', 'high', config.ideal_swing), 0);
  assert.equal(swingMismatch('level', 'low', config.ideal_swing), 1);
  assert.equal(swingMismatch('upper', 'high', config.ideal_swing), 2);
  assert.equal(swingMismatch('down', 'low', config.ideal_swing), 2);
});

test('ideal swing with perfect timing gives the outcome table result', () => {
  assert.equal(judgeSwing({ timingError: 0, swingType: 'upper', pitchHeight: 'low' }, config), config.outcomes.upper.perfect);
  assert.equal(judgeSwing({ timingError: 0, swingType: 'level', pitchHeight: 'middle' }, config), config.outcomes.level.perfect);
  assert.equal(judgeSwing({ timingError: 0, swingType: 'down', pitchHeight: 'high' }, config), config.outcomes.down.perfect);
});

test('one step off drops the timing grade by one', () => {
  assert.equal(judgeSwing({ timingError: 0, swingType: 'level', pitchHeight: 'low' }, config), config.outcomes.level.good);
  assert.equal(judgeSwing({ timingError: windows.ok, swingType: 'level', pitchHeight: 'low' }, config), 'foul');
});

test('opposite swing is a foul with good timing, otherwise a whiff', () => {
  assert.equal(judgeSwing({ timingError: 0, swingType: 'upper', pitchHeight: 'high' }, config), 'foul');
  assert.equal(judgeSwing({ timingError: windows.ok, swingType: 'upper', pitchHeight: 'high' }, config), 'whiff');
});

test('timing outside every window is a whiff', () => {
  assert.equal(judgeSwing({ timingError: windows.foul + 0.05, swingType: 'upper', pitchHeight: 'low' }, config), 'whiff');
});

test('classifySwipe maps direction to swing type', () => {
  const far = config.swipe.min_distance_px * 2;
  assert.equal(classifySwipe(0, -far, config.swipe), 'upper');
  assert.equal(classifySwipe(far, 0, config.swipe), 'level');
  assert.equal(classifySwipe(-far, 0, config.swipe), 'level');
  assert.equal(classifySwipe(0, far, config.swipe), 'down');
  assert.equal(classifySwipe(far, -far, config.swipe), 'upper');
  assert.equal(classifySwipe(1, 1, config.swipe), null);
});
