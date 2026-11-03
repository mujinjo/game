// Flat-vector batter seen from the catcher's position (story-008,
// design/game-brief.md Art direction). A right-handed batter stands on the
// screen-left side of the plate in a side stance: chest toward the plate
// (screen right), front foot toward the pitcher (into the screen), head turned
// to the pitcher. Swing poses are computed from the swing type so each type
// sweeps through a different row of the zone.

import { lerp, lerpPoint, ease } from './pose_math.js';

const COLORS = {
  jersey: '#f4f4f4',
  jerseyFar: '#cfd3da',
  trim: '#1f2a44',
  pants: '#dcdcdc',
  pantsFar: '#b9bcc2',
  helmet: '#1f2a44',
  skin: '#e8b98a',
  skinFar: '#cf9f72',
  bat: '#c8955a',
  batDark: '#8a5a2b',
  shoe: '#222222',
};

/** Bat angle at contact for each swing type, degrees (0 = pointing right, positive = down). */
const CONTACT_ANGLE = { upper: 14, level: 0, down: -14 };

/** Fraction of the bat length where the sweet spot sits. */
const SWEET_SPOT = 0.75;

/**
 * Body anchor points in CSS px. "rear" is the near side (toward the catcher),
 * "front" the far side (toward the pitcher).
 * @param {{x: number, y: number}} feet Point between the feet.
 * @param {number} height Batter height.
 */
export function batterBody(feet, height) {
  const at = (x, y) => ({ x: feet.x + x * height, y: feet.y + y * height });
  return {
    feet,
    rearFoot: at(-0.12, 0),
    frontFoot: at(0.15, -0.05),
    rearHip: at(-0.04, -0.45),
    frontHip: at(0.04, -0.46),
    rearShoulder: at(-0.04, -0.76),
    frontShoulder: at(0.05, -0.78),
    head: at(0.03, -0.88),
  };
}

/**
 * Hand position, bat angle (radians), bat length scale and upper-body lean for a swing moment.
 * @param {object} body From batterBody().
 * @param {number} height Batter height, CSS px.
 * @param {number} batLength Bat length, CSS px.
 * @param {{swingType: string, progress: number, contactFraction: number, target: {x: number, y: number}}|null} swing
 *   null for the ready stance. target is the zone point the sweet spot passes at contact.
 * @returns {{hands: {x: number, y: number}, angle: number, scale: number, lean: number}}
 */
export function batterPose(body, height, batLength, swing) {
  const stance = {
    hands: { x: body.rearShoulder.x - 0.02 * height, y: body.rearShoulder.y - 0.09 * height },
    angle: degToRad(-118),
    scale: 0.85,
    lean: 0,
  };
  if (!swing) return stance;

  const contactAngle = degToRad(CONTACT_ANGLE[swing.swingType]);
  const contact = {
    hands: {
      x: swing.target.x - Math.cos(contactAngle) * batLength * SWEET_SPOT,
      y: swing.target.y - Math.sin(contactAngle) * batLength * SWEET_SPOT,
    },
    angle: contactAngle,
    scale: 1,
    lean: 0.05,
  };
  const finish = {
    hands: { x: body.frontShoulder.x + 0.08 * height, y: body.frontShoulder.y - 0.06 * height },
    angle: contactAngle + degToRad(38),
    scale: 0.5,
    lean: 0.03,
  };

  const c = swing.contactFraction;
  if (swing.progress <= c) return blend(stance, contact, ease(swing.progress / c));
  return blend(contact, finish, ease((swing.progress - c) / (1 - c)));
}

/**
 * Draws the batter and bat. Far-side limbs are drawn first in a darker shade.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} body From batterBody().
 * @param {number} height Batter height, CSS px.
 * @param {number} batLength Bat length, CSS px.
 * @param {{hands: {x: number, y: number}, angle: number, scale: number, lean: number}} pose From batterPose().
 */
export function drawBatter(ctx, body, height, batLength, pose) {
  const h = height;
  const shift = (pt) => ({ x: pt.x + pose.lean * h, y: pt.y });
  const rearShoulder = shift(body.rearShoulder);
  const frontShoulder = shift(body.frontShoulder);
  const head = shift(body.head);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Far leg and far (lead) arm, behind the body.
  drawLeg(ctx, body.frontHip, body.frontFoot, 1, h, COLORS.pantsFar);
  ctx.strokeStyle = COLORS.jerseyFar;
  ctx.lineWidth = h * 0.055;
  stroke(ctx, [frontShoulder, elbow(frontShoulder, pose.hands, h), pose.hands]);

  // Near leg.
  drawLeg(ctx, body.rearHip, body.rearFoot, -1, h, COLORS.pants);

  // Torso in profile, chest toward the plate.
  const hip = lerpPoint(body.rearHip, body.frontHip, 0.5);
  ctx.fillStyle = COLORS.jersey;
  ctx.beginPath();
  ctx.moveTo(rearShoulder.x - 0.05 * h, rearShoulder.y + 0.01 * h);
  ctx.lineTo(frontShoulder.x + 0.03 * h, frontShoulder.y);
  ctx.quadraticCurveTo(frontShoulder.x + 0.09 * h, lerp(frontShoulder.y, hip.y, 0.4), hip.x + 0.08 * h, hip.y);
  ctx.lineTo(hip.x - 0.1 * h, hip.y + 0.01 * h);
  ctx.quadraticCurveTo(hip.x - 0.12 * h, lerp(hip.y, rearShoulder.y, 0.5), rearShoulder.x - 0.05 * h, rearShoulder.y + 0.01 * h);
  ctx.closePath();
  ctx.fill();
  // Side seam stripe and belt.
  ctx.strokeStyle = COLORS.trim;
  ctx.lineWidth = h * 0.012;
  stroke(ctx, [{ x: rearShoulder.x + 0.005 * h, y: rearShoulder.y + 0.05 * h }, { x: hip.x - 0.01 * h, y: hip.y - 0.02 * h }]);
  ctx.fillStyle = COLORS.trim;
  ctx.fillRect(hip.x - 0.1 * h, hip.y - 0.02 * h, 0.18 * h, 0.025 * h);

  // Neck, face and helmet, turned toward the pitcher.
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(head.x - 0.025 * h, head.y + 0.02 * h, 0.05 * h, 0.08 * h);
  ctx.beginPath();
  ctx.arc(head.x + 0.008 * h, head.y + 0.008 * h, 0.064 * h, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.helmet;
  ctx.beginPath();
  ctx.arc(head.x - 0.006 * h, head.y - 0.006 * h, 0.072 * h, Math.PI * 0.82, Math.PI * 2.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(head.x + 0.07 * h, head.y - 0.012 * h, 0.04 * h, 0.012 * h, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(head.x - 0.022 * h, head.y + 0.022 * h, 0.034 * h, 0, Math.PI * 2);
  ctx.fill();

  // Bat, then the near (back) arm over the grip.
  const len = batLength * pose.scale;
  const tip = { x: pose.hands.x + Math.cos(pose.angle) * len, y: pose.hands.y + Math.sin(pose.angle) * len };
  const knob = { x: pose.hands.x - Math.cos(pose.angle) * 0.06 * batLength, y: pose.hands.y - Math.sin(pose.angle) * 0.06 * batLength };
  drawBat(ctx, knob, tip, h);

  ctx.strokeStyle = COLORS.jersey;
  ctx.lineWidth = h * 0.06;
  stroke(ctx, [rearShoulder, elbow(rearShoulder, pose.hands, h), pose.hands]);
  ctx.fillStyle = COLORS.skin;
  ctx.beginPath();
  ctx.arc(pose.hands.x, pose.hands.y, 0.034 * h, 0, Math.PI * 2);
  ctx.fill();
}

/** Bent leg from hip to foot; side picks which way the knee points (+1 toward the plate). */
function drawLeg(ctx, hip, foot, side, h, color) {
  const knee = { x: lerp(hip.x, foot.x, 0.5) + side * 0.05 * h, y: lerp(hip.y, foot.y, 0.48) };
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 0.08;
  stroke(ctx, [hip, knee, foot]);
  ctx.fillStyle = COLORS.shoe;
  ctx.beginPath();
  ctx.ellipse(foot.x + 0.03 * h, foot.y, 0.065 * h, 0.024 * h, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Elbow point: the arm sags below the line from shoulder to hands. */
function elbow(shoulder, hands, h) {
  return { x: lerp(shoulder.x, hands.x, 0.5) - 0.02 * h, y: Math.max(shoulder.y, hands.y) + 0.04 * h };
}

function drawBat(ctx, knob, tip, height) {
  const dx = tip.x - knob.x;
  const dy = tip.y - knob.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const handle = 0.012 * height;
  const barrel = 0.03 * height;
  const neck = lerpPoint(knob, tip, 0.45);
  ctx.fillStyle = COLORS.bat;
  ctx.beginPath();
  ctx.moveTo(knob.x + nx * handle, knob.y + ny * handle);
  ctx.lineTo(neck.x + nx * handle, neck.y + ny * handle);
  ctx.lineTo(tip.x + nx * barrel, tip.y + ny * barrel);
  ctx.arc(tip.x, tip.y, barrel, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  ctx.lineTo(neck.x - nx * handle, neck.y - ny * handle);
  ctx.lineTo(knob.x - nx * handle, knob.y - ny * handle);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.batDark;
  ctx.beginPath();
  ctx.arc(knob.x, knob.y, handle * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function blend(a, b, t) {
  return {
    hands: lerpPoint(a.hands, b.hands, t),
    angle: lerp(a.angle, b.angle, t),
    scale: lerp(a.scale, b.scale, t),
    lean: lerp(a.lean, b.lean, t),
  };
}

function stroke(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const pt of points.slice(1)) ctx.lineTo(pt.x, pt.y);
  ctx.stroke();
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}
