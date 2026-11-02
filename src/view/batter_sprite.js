// Flat-vector batter seen from behind, from the catcher's position (story-008,
// design/game-brief.md Art direction). A right-handed batter standing on the
// screen-left side of the plate. Swing poses are computed from the swing type
// so each type sweeps through a different row of the zone.

import { lerp, lerpPoint, ease } from './pose_math.js';

const COLORS = {
  jersey: '#f4f4f4',
  trim: '#1f2a44',
  pants: '#dcdcdc',
  helmet: '#1f2a44',
  skin: '#e8b98a',
  bat: '#c8955a',
  batDark: '#8a5a2b',
  shoe: '#222222',
};

/** Bat angle at contact for each swing type, degrees (0 = pointing right, positive = down). */
const CONTACT_ANGLE = { upper: 14, level: 0, down: -14 };

/** Fraction of the bat length where the sweet spot sits. */
const SWEET_SPOT = 0.75;

/**
 * Body anchor points in CSS px.
 * @param {{x: number, y: number}} feet Point between the feet.
 * @param {number} height Batter height.
 */
export function batterBody(feet, height) {
  return {
    feet,
    hip: { x: feet.x, y: feet.y - 0.46 * height },
    rearShoulder: { x: feet.x - 0.12 * height, y: feet.y - 0.76 * height },
    frontShoulder: { x: feet.x + 0.12 * height, y: feet.y - 0.74 * height },
    head: { x: feet.x + 0.01 * height, y: feet.y - 0.87 * height },
  };
}

/**
 * Hand position, bat angle (radians) and bat length scale for a swing moment.
 * @param {object} body From batterBody().
 * @param {number} height Batter height, CSS px.
 * @param {number} batLength Bat length, CSS px.
 * @param {{swingType: string, progress: number, contactFraction: number, target: {x: number, y: number}}|null} swing
 *   null for the ready stance. target is the zone point the sweet spot passes at contact.
 * @returns {{hands: {x: number, y: number}, angle: number, scale: number}}
 */
export function batterPose(body, height, batLength, swing) {
  const stance = {
    hands: { x: body.rearShoulder.x + 0.1 * height, y: body.rearShoulder.y - 0.06 * height },
    angle: degToRad(-108),
    scale: 0.85,
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
  };
  const finish = {
    hands: { x: body.frontShoulder.x + 0.08 * height, y: body.frontShoulder.y - 0.04 * height },
    angle: contactAngle + degToRad(38),
    scale: 0.5,
  };

  const c = swing.contactFraction;
  if (swing.progress <= c) return blend(stance, contact, ease(swing.progress / c));
  return blend(contact, finish, ease((swing.progress - c) / (1 - c)));
}

/**
 * Draws the batter and bat.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} body From batterBody().
 * @param {number} height Batter height, CSS px.
 * @param {number} batLength Bat length, CSS px.
 * @param {{hands: {x: number, y: number}, angle: number, scale: number}} pose From batterPose().
 */
export function drawBatter(ctx, body, height, batLength, pose) {
  const { feet, hip, rearShoulder, frontShoulder, head } = body;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Legs in a wide stance.
  ctx.strokeStyle = COLORS.pants;
  ctx.lineWidth = height * 0.085;
  for (const side of [-1, 1]) {
    const hipSide = { x: hip.x + side * 0.06 * height, y: hip.y };
    const foot = { x: feet.x + side * 0.15 * height, y: feet.y };
    const knee = { x: lerp(hipSide.x, foot.x, 0.5) + side * 0.02 * height, y: lerp(hipSide.y, foot.y, 0.5) };
    stroke(ctx, [hipSide, knee, foot]);
    ctx.fillStyle = COLORS.shoe;
    ctx.beginPath();
    ctx.ellipse(foot.x, foot.y, 0.06 * height, 0.025 * height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Back of the jersey with a number.
  ctx.fillStyle = COLORS.jersey;
  ctx.beginPath();
  ctx.moveTo(rearShoulder.x, rearShoulder.y);
  ctx.lineTo(frontShoulder.x, frontShoulder.y);
  ctx.lineTo(hip.x + 0.1 * height, hip.y);
  ctx.lineTo(hip.x - 0.1 * height, hip.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.trim;
  ctx.fillRect(hip.x - 0.1 * height, hip.y - 0.025 * height, 0.2 * height, 0.025 * height);
  ctx.font = `bold ${0.13 * height}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('7', hip.x, lerp(hip.y, rearShoulder.y, 0.55));

  // Bat, drawn before the arms so the hands sit on top of the grip.
  const len = batLength * pose.scale;
  const tip = { x: pose.hands.x + Math.cos(pose.angle) * len, y: pose.hands.y + Math.sin(pose.angle) * len };
  const knob = { x: pose.hands.x - Math.cos(pose.angle) * 0.06 * batLength, y: pose.hands.y - Math.sin(pose.angle) * 0.06 * batLength };
  drawBat(ctx, knob, tip, height);

  // Arms meet at the grip.
  ctx.strokeStyle = COLORS.jersey;
  ctx.lineWidth = height * 0.06;
  stroke(ctx, [rearShoulder, lerpPoint(rearShoulder, pose.hands, 0.5), pose.hands]);
  stroke(ctx, [frontShoulder, lerpPoint(frontShoulder, pose.hands, 0.5), pose.hands]);
  ctx.fillStyle = COLORS.skin;
  ctx.beginPath();
  ctx.arc(pose.hands.x, pose.hands.y, 0.035 * height, 0, Math.PI * 2);
  ctx.fill();

  // Neck and helmet, seen from behind.
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(head.x - 0.03 * height, head.y, 0.06 * height, 0.12 * height);
  ctx.fillStyle = COLORS.helmet;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 0.075 * height, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(head.x - 0.06 * height, head.y + 0.02 * height, 0.04 * height, 0.05 * height, 0, 0, Math.PI * 2);
  ctx.fill();
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
  return { hands: lerpPoint(a.hands, b.hands, t), angle: lerp(a.angle, b.angle, t), scale: lerp(a.scale, b.scale, t) };
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

