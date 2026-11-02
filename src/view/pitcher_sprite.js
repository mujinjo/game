// Flat-vector pitcher seen from the catcher's position (story-008,
// design/game-brief.md Art direction). A right-handed pitcher facing the
// camera, so the throwing arm is on the screen-left side.
// All joint positions are in units of the pitcher's height, relative to the
// point between the feet (x right, y down).

import { blendPose, ease } from './pose_math.js';

const COLORS = {
  jersey: '#c0392b',
  pants: '#e6e6e6',
  skin: '#e8b98a',
  cap: '#1f2a44',
  glove: '#7a4a24',
  shoe: '#222222',
};

/** Hand position at the release instant; the ball starts here. */
const RELEASE_HAND = { x: -0.2, y: -1.02 };

const POSES = {
  set: {
    hip: { x: 0, y: -0.45 },
    leftFoot: { x: -0.08, y: 0 },
    rightFoot: { x: 0.08, y: 0 },
    throwHand: { x: -0.02, y: -0.66 },
    gloveHand: { x: 0.02, y: -0.66 },
    lean: 0,
  },
  legLift: {
    hip: { x: 0, y: -0.47 },
    leftFoot: { x: -0.04, y: 0 },
    rightFoot: { x: 0.06, y: -0.26 },
    throwHand: { x: -0.02, y: -0.86 },
    gloveHand: { x: 0.02, y: -0.86 },
    lean: 0,
  },
  cocked: {
    hip: { x: 0.03, y: -0.4 },
    leftFoot: { x: -0.08, y: 0 },
    rightFoot: { x: 0.2, y: 0 },
    throwHand: { x: -0.34, y: -0.86 },
    gloveHand: { x: 0.3, y: -0.72 },
    lean: 0,
  },
  release: {
    hip: { x: 0.04, y: -0.4 },
    leftFoot: { x: -0.08, y: 0 },
    rightFoot: { x: 0.2, y: 0 },
    throwHand: RELEASE_HAND,
    gloveHand: { x: 0.18, y: -0.62 },
    lean: 0.03,
  },
  followThrough: {
    hip: { x: 0.05, y: -0.38 },
    leftFoot: { x: 0.02, y: -0.04 },
    rightFoot: { x: 0.2, y: 0 },
    throwHand: { x: 0.16, y: -0.42 },
    gloveHand: { x: 0.12, y: -0.66 },
    lean: 0.08,
  },
};

/**
 * Returns the pose for a moment in the pitch.
 * @param {'idle'|'windup'|'follow'} phase
 * @param {number} t Progress through the phase, 0..1.
 * @returns {object}
 */
export function pitcherPose(phase, t) {
  if (phase === 'windup') {
    if (t < 0.45) return blendPose(POSES.set, POSES.legLift, ease(t / 0.45));
    if (t < 0.85) return blendPose(POSES.legLift, POSES.cocked, ease((t - 0.45) / 0.4));
    return blendPose(POSES.cocked, POSES.release, ease((t - 0.85) / 0.15));
  }
  if (phase === 'follow') return blendPose(POSES.release, POSES.followThrough, ease(t));
  return POSES.set;
}

/**
 * Screen position of the release hand, where the ball leaves the pitcher.
 * @param {{x: number, y: number}} feet Point between the feet, CSS px.
 * @param {number} height Pitcher height, CSS px.
 */
export function releasePoint(feet, height) {
  return { x: feet.x + RELEASE_HAND.x * height, y: feet.y + RELEASE_HAND.y * height };
}

/**
 * Draws the pitcher.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} feet Point between the feet, CSS px.
 * @param {number} height Pitcher height, CSS px.
 * @param {object} pose From pitcherPose().
 */
export function drawPitcher(ctx, feet, height, pose) {
  const p = (pt) => ({ x: feet.x + pt.x * height, y: feet.y + pt.y * height });
  const hip = p(pose.hip);
  const shoulderY = pose.hip.y - 0.33;
  const leanX = pose.lean;
  const lShoulder = p({ x: pose.hip.x - 0.11 + leanX, y: shoulderY });
  const rShoulder = p({ x: pose.hip.x + 0.11 + leanX, y: shoulderY });
  const neck = p({ x: pose.hip.x + leanX, y: shoulderY - 0.02 });
  const head = p({ x: pose.hip.x + leanX * 1.3, y: shoulderY - 0.11 });

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Legs.
  ctx.strokeStyle = COLORS.pants;
  ctx.lineWidth = height * 0.075;
  for (const [side, foot] of [[-0.05, pose.leftFoot], [0.05, pose.rightFoot]]) {
    const hipSide = { x: hip.x + side * height, y: hip.y };
    const footPt = p(foot);
    const knee = { x: (hipSide.x + footPt.x) / 2 + side * height * 0.5, y: (hipSide.y + footPt.y) / 2 };
    line(ctx, [hipSide, knee, footPt]);
    ctx.fillStyle = COLORS.shoe;
    ctx.beginPath();
    ctx.ellipse(footPt.x, footPt.y, height * 0.05, height * 0.022, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Torso.
  ctx.fillStyle = COLORS.jersey;
  ctx.beginPath();
  ctx.moveTo(lShoulder.x, lShoulder.y);
  ctx.lineTo(rShoulder.x, rShoulder.y);
  ctx.lineTo(hip.x + height * 0.08, hip.y);
  ctx.lineTo(hip.x - height * 0.08, hip.y);
  ctx.closePath();
  ctx.fill();

  // Arms: throwing arm from the left shoulder, glove arm from the right.
  ctx.strokeStyle = COLORS.jersey;
  ctx.lineWidth = height * 0.055;
  const throwHand = p(pose.throwHand);
  const gloveHand = p(pose.gloveHand);
  line(ctx, [lShoulder, elbow(lShoulder, throwHand, -1, height), throwHand]);
  line(ctx, [rShoulder, elbow(rShoulder, gloveHand, 1, height), gloveHand]);
  ctx.fillStyle = COLORS.skin;
  circle(ctx, throwHand, height * 0.032);
  ctx.fillStyle = COLORS.glove;
  circle(ctx, gloveHand, height * 0.05);

  // Head and cap.
  ctx.strokeStyle = COLORS.skin;
  ctx.lineWidth = height * 0.04;
  line(ctx, [neck, head]);
  ctx.fillStyle = COLORS.skin;
  circle(ctx, head, height * 0.07);
  ctx.fillStyle = COLORS.cap;
  ctx.beginPath();
  ctx.arc(head.x, head.y - height * 0.01, height * 0.072, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(head.x - height * 0.09, head.y - height * 0.016, height * 0.18, height * 0.02);
}

function elbow(shoulder, hand, side, height) {
  return { x: (shoulder.x + hand.x) / 2 + side * height * 0.06, y: (shoulder.y + hand.y) / 2 + height * 0.04 };
}

function line(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const pt of points.slice(1)) ctx.lineTo(pt.x, pt.y);
  ctx.stroke();
}

function circle(ctx, center, r) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
  ctx.fill();
}
