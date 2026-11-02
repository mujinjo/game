// Batting view: pitcher, batter, ball flight and result text on a Canvas
// (design/game-brief.md MVP 2, story-001-swipe-swing-batting,
// story-008-pitcher-batter-graphics).
// Judgement lives in swing_judge.js; this module only presents and reports.

import { judgeSwing, PITCH_HEIGHTS } from './swing_judge.js';
import { SwipeInput } from './swipe_input.js';
import { pitcherPose, releasePoint, drawPitcher } from '../view/pitcher_sprite.js';
import { batterBody, batterPose, drawBatter } from '../view/batter_sprite.js';
import { clamp01, lerp } from '../view/pose_math.js';

const RESULT_TEXT = {
  whiff: '헛스윙',
  foul: '파울',
  groundout: '땅볼 아웃',
  flyout: '뜬공 아웃',
  single: '안타',
  double: '2루타',
  home_run: '홈런!',
  no_swing: '노스윙',
};

const SWING_TEXT = { upper: '어퍼', level: '레벨', down: '다운' };

const HEIGHT_TEXT = { high: '높은 공', middle: '가운데 공', low: '낮은 공' };

/** Vertical offset of each pitch height inside the zone, as a fraction of zone height. */
const HEIGHT_OFFSET = { high: -1 / 3, middle: 0, low: 1 / 3 };

const COLORS = {
  sky: '#1d3b2a',
  grass: '#2f6b3f',
  dirt: '#a8794f',
  zone: 'rgba(255,255,255,0.85)',
  zoneBand: 'rgba(255,255,255,0.18)',
  ball: '#ffffff',
  seam: '#d33a3a',
  text: '#ffffff',
  good: '#ffd23f',
  bad: '#ff8a8a',
};

const GOOD_RESULTS = new Set(['single', 'double', 'home_run']);

const FONT = 'system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export class BatterView {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} config Balance config.
   * @param {{random?: () => number, now?: () => number, onSwingResolved?: (r: object) => void}} [options]
   *   random and now are injectable for deterministic runs; onSwingResolved
   *   receives { result, swingType, pitchHeight, timingError } once per pitch.
   */
  constructor(canvas, config, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.random = options.random ?? Math.random;
    this.now = options.now ?? (() => performance.now());
    this.onSwingResolved = options.onSwingResolved ?? (() => {});
    // States: 'windup' (pitcher winding up) → 'pitching' (ball in flight) → 'result'.
    this.state = 'windup';
    this.windupStart = 0;
    this.pitchStart = 0;
    this.resultAt = 0;
    this.resultUntil = 0;
    this.pitch = null;
    this.lastSwing = null;
    this.lastResult = null;
    this.input = new SwipeInput(canvas, config.swipe, (swing) => this.handleSwing(swing));
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /** Starts the pitch loop. */
  start() {
    this.startPitch();
    const frame = () => {
      this.update();
      this.draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** Picks the next pitch and starts the pitcher's windup. */
  startPitch() {
    const height = PITCH_HEIGHTS[Math.floor(this.random() * PITCH_HEIGHTS.length)];
    const jitter = (this.random() * 2 - 1) * this.config.pitch.arrival_jitter_x;
    this.pitch = { height, jitter };
    this.windupStart = this.now();
    this.pitchStart = this.windupStart + this.config.pitch.windup_seconds * 1000;
    this.state = 'windup';
    this.lastSwing = null;
    this.lastResult = null;
  }

  update() {
    const t = this.now();
    const { pitch } = this.config;
    if (this.state === 'windup') {
      if (t >= this.pitchStart) this.state = 'pitching';
    } else if (this.state === 'pitching') {
      const elapsed = (t - this.pitchStart) / 1000;
      // A pointer that is down but not yet classified still gets judged on release.
      if (elapsed > pitch.travel_seconds + pitch.late_grace_seconds && !this.input.isPending) {
        this.resolve({ result: 'no_swing', swingType: null, timingError: null });
      }
    } else if (t >= this.resultUntil) {
      this.startPitch();
    }
  }

  handleSwing(swing) {
    if (this.state !== 'pitching' || this.lastSwing) return;
    this.lastSwing = swing;
    const timingError = (swing.time - this.pitchStart) / 1000 - this.config.pitch.travel_seconds;
    const result = judgeSwing({ timingError, swingType: swing.swingType, pitchHeight: this.pitch.height }, this.config);
    this.resolve({ result, swingType: swing.swingType, timingError });
  }

  resolve({ result, swingType, timingError }) {
    const { pitch } = this.config;
    this.state = 'result';
    this.lastResult = { result, swingType, timingError, pitchHeight: this.pitch.height };
    // The batted ball leaves from the plate when the pitch arrives, or now if the swing came late.
    this.resultAt = Math.max(this.now(), this.pitchStart + pitch.travel_seconds * 1000);
    this.resultUntil = this.now() + (pitch.result_display_seconds + pitch.interval_seconds) * 1000;
    this.onSwingResolved(this.lastResult);
  }

  /** Zone, pitcher and batter placement, in CSS pixels. */
  geometry() {
    const { layout } = this.config;
    const zoneW = layout.zone_width * this.height;
    const zoneH = layout.zone_height * this.height;
    const zoneX = layout.zone_center_x * this.width - zoneW / 2;
    const zoneY = layout.zone_center_y * this.height - zoneH / 2;
    const unit = Math.min(this.height, this.width * layout.character_unit_width_ratio);
    const pitcherFeet = { x: layout.pitcher_x * this.width, y: layout.pitcher_y * this.height };
    const pitcherHeight = layout.pitcher_height * unit;
    const batterHeight = layout.batter_height * unit;
    const batterFeet = {
      x: Math.max(zoneX - layout.batter_offset_zone_widths * zoneW, layout.batter_min_x * batterHeight),
      y: this.height,
    };
    const rowY = (height) => zoneY + zoneH / 2 + HEIGHT_OFFSET[height] * zoneH;
    const arrival = { x: zoneX + zoneW / 2 + this.pitch.jitter * zoneW / 2, y: rowY(this.pitch.height) };
    return {
      zoneX, zoneY, zoneW, zoneH, rowY, arrival,
      pitcherFeet, pitcherHeight,
      release: releasePoint(pitcherFeet, pitcherHeight),
      batterFeet, batterHeight,
      batLength: layout.bat_length * batterHeight,
    };
  }

  draw() {
    const { width, height } = this;
    const g = this.geometry();
    this.drawField(g);
    this.drawPitcherNow(g);
    this.drawZone(g);
    this.drawBallNow(g);
    this.drawBatterNow(g);
    this.drawText(width, height);
  }

  drawField(g) {
    const { ctx, width, height } = this;
    const moundY = g.pitcherFeet.y;
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, moundY, width, height - moundY);
    // Mound and the dirt lane toward home plate.
    ctx.fillStyle = COLORS.dirt;
    ctx.beginPath();
    ctx.moveTo(g.pitcherFeet.x - width * 0.04, moundY);
    ctx.lineTo(g.pitcherFeet.x + width * 0.04, moundY);
    ctx.lineTo(g.zoneX + g.zoneW * 1.3, height);
    ctx.lineTo(g.zoneX - g.zoneW * 0.3, height);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(g.pitcherFeet.x, moundY, width * 0.06, height * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPitcherNow(g) {
    const t = this.now();
    const followMs = this.config.pitch.follow_through_seconds * 1000;
    let pose;
    if (this.state === 'windup') {
      pose = pitcherPose('windup', clamp01((t - this.windupStart) / (this.pitchStart - this.windupStart)));
    } else if (t - this.pitchStart < followMs) {
      pose = pitcherPose('follow', clamp01((t - this.pitchStart) / followMs));
    } else {
      pose = pitcherPose('follow', 1);
    }
    drawPitcher(this.ctx, g.pitcherFeet, g.pitcherHeight, pose);
  }

  drawZone(g) {
    const { ctx } = this;
    ctx.fillStyle = COLORS.zoneBand;
    ctx.fillRect(g.zoneX, g.zoneY + g.zoneH / 3, g.zoneW, g.zoneH / 3);
    ctx.strokeStyle = COLORS.zone;
    ctx.lineWidth = 3;
    ctx.strokeRect(g.zoneX, g.zoneY, g.zoneW, g.zoneH);
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i += 1) {
      const y = g.zoneY + (g.zoneH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(g.zoneX, y);
      ctx.lineTo(g.zoneX + g.zoneW, y);
      ctx.stroke();
    }
  }

  drawBallNow(g) {
    const { layout, pitch, animation, hit_flight: hitFlight } = this.config;
    const t = this.now();
    if (this.state === 'windup') return;

    const inFlight = this.state === 'pitching' || t < this.resultAt;
    if (inFlight) {
      const progress = Math.min((t - this.pitchStart) / 1000 / pitch.travel_seconds, 1);
      const pos = {
        x: lerp(g.release.x, g.arrival.x, progress),
        y: lerp(g.release.y, g.arrival.y, progress),
      };
      this.drawBall(pos, lerp(layout.ball_scale_start, layout.ball_scale_end, progress));
      return;
    }

    // After contact (or a miss), the ball follows its result's flight path.
    const flight = hitFlight[this.lastResult.result];
    const f = clamp01((t - this.resultAt) / 1000 / animation.hit_flight_seconds);
    if (f >= 1 && flight.scale_end < layout.ball_scale_end) return;
    const pos = {
      x: g.arrival.x + flight.dx * this.height * f,
      y: g.arrival.y + flight.dy * this.height * f - flight.arc * this.height * Math.sin(Math.PI * f),
    };
    this.drawBall(pos, layout.ball_scale_end * lerp(1, flight.scale_end, f));
  }

  drawBall(pos, scale) {
    const { ctx } = this;
    const r = this.config.layout.ball_radius * this.height * scale;
    if (r <= 0.3) return;
    ctx.fillStyle = COLORS.ball;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.seam;
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath();
    ctx.arc(pos.x - r * 0.9, pos.y, r * 0.75, -0.9, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x + r * 0.9, pos.y, r * 0.75, Math.PI - 0.9, Math.PI + 0.9);
    ctx.stroke();
  }

  drawBatterNow(g) {
    const { animation, ideal_swing: idealSwing } = this.config;
    const body = batterBody(g.batterFeet, g.batterHeight);
    let swing = null;
    if (this.lastSwing) {
      const { swingType } = this.lastSwing;
      // Each swing type sweeps the row it is built for; the sweet spot crosses the zone centre line.
      const row = Object.keys(idealSwing).find((h) => idealSwing[h] === swingType);
      // The swing is only known once the pointer moves, so the animation is
      // backdated: its contact frame lands on the swing time, where the ball is.
      const swingMs = animation.swing_seconds * 1000;
      const animStart = this.lastSwing.time - animation.swing_contact_fraction * swingMs;
      swing = {
        swingType,
        progress: clamp01((this.now() - animStart) / swingMs),
        contactFraction: animation.swing_contact_fraction,
        target: { x: g.zoneX + g.zoneW / 2, y: g.rowY(row) },
      };
    }
    drawBatter(this.ctx, body, g.batterHeight, g.batLength, batterPose(body, g.batterHeight, g.batLength, swing));
  }

  drawText(width, height) {
    const { ctx } = this;
    const base = Math.max(14, Math.min(width, height) * 0.035);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = COLORS.text;
    ctx.font = `${base}px ${FONT}`;
    ctx.fillText('위로 쓸기: 어퍼 · 옆으로: 레벨 · 아래로: 다운', width / 2, height - base * 1.4);

    if (!this.lastResult) return;
    const { result, swingType, timingError, pitchHeight } = this.lastResult;
    ctx.fillStyle = GOOD_RESULTS.has(result) ? COLORS.good : COLORS.bad;
    ctx.font = `bold ${base * 2.6}px ${FONT}`;
    ctx.fillText(RESULT_TEXT[result], width / 2, height * 0.1);

    ctx.fillStyle = COLORS.text;
    ctx.font = `${base}px ${FONT}`;
    let timingText = '딱 맞음';
    if (swingType && Math.abs(timingError) >= 0.0005) {
      timingText = `${timingError > 0 ? '늦음' : '빠름'} ${Math.abs(timingError).toFixed(3)}초`;
    }
    const detail = swingType
      ? `${HEIGHT_TEXT[pitchHeight]} · ${SWING_TEXT[swingType]} 스윙 · ${timingText}`
      : HEIGHT_TEXT[pitchHeight];
    ctx.fillText(detail, width / 2, height * 0.1 + base * 2.4);
  }
}
