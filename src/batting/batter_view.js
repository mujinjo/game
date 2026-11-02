// Batting view: ball flight, swipe trail and result text on a Canvas
// (design/game-brief.md MVP 2, story-001-swipe-swing-batting).
// Judgement lives in swing_judge.js; this module only presents and reports.

import { judgeSwing, PITCH_HEIGHTS } from './swing_judge.js';
import { SwipeInput } from './swipe_input.js';

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
  trail: '#ffd23f',
  text: '#ffffff',
  good: '#ffd23f',
  bad: '#ff8a8a',
};

const GOOD_RESULTS = new Set(['single', 'double', 'home_run']);

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
    this.state = 'pitching';
    this.pitchStart = 0;
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

  startPitch() {
    const height = PITCH_HEIGHTS[Math.floor(this.random() * PITCH_HEIGHTS.length)];
    const jitter = (this.random() * 2 - 1) * this.config.pitch.arrival_jitter_x;
    this.pitch = { height, jitter };
    this.pitchStart = this.now();
    this.state = 'pitching';
    this.lastSwing = null;
    this.lastResult = null;
  }

  update() {
    const t = this.now();
    const { pitch } = this.config;
    if (this.state === 'pitching') {
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
    this.resultUntil = this.now() + (pitch.result_display_seconds + pitch.interval_seconds) * 1000;
    this.onSwingResolved(this.lastResult);
  }

  /** Zone rectangle and the ball's arrival point, in CSS pixels. */
  geometry() {
    const { layout } = this.config;
    const zoneW = layout.zone_width * this.height;
    const zoneH = layout.zone_height * this.height;
    const zoneX = layout.zone_center_x * this.width - zoneW / 2;
    const zoneY = layout.zone_center_y * this.height - zoneH / 2;
    const arrival = {
      x: zoneX + zoneW / 2 + this.pitch.jitter * zoneW / 2,
      y: zoneY + zoneH / 2 + HEIGHT_OFFSET[this.pitch.height] * zoneH,
    };
    const pitcher = { x: layout.pitcher_x * this.width, y: layout.pitcher_y * this.height };
    return { zoneX, zoneY, zoneW, zoneH, arrival, pitcher };
  }

  draw() {
    const { width, height } = this;
    const g = this.geometry();
    this.drawField(g);
    this.drawZone(g);

    const travel = this.config.pitch.travel_seconds;
    if (this.state === 'pitching') {
      const progress = Math.min((this.now() - this.pitchStart) / 1000 / travel, 1);
      this.drawBall(g, progress);
    } else {
      this.drawBall(g, 1);
    }
    if (this.lastSwing) this.drawTrail(this.lastSwing);
    this.drawText(width, height);
  }

  drawField(g) {
    const { ctx, width, height } = this;
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, g.pitcher.y, width, height - g.pitcher.y);
    // Mound and the dirt lane toward home plate.
    ctx.fillStyle = COLORS.dirt;
    ctx.beginPath();
    ctx.moveTo(g.pitcher.x - width * 0.04, g.pitcher.y);
    ctx.lineTo(g.pitcher.x + width * 0.04, g.pitcher.y);
    ctx.lineTo(g.zoneX + g.zoneW * 1.3, height);
    ctx.lineTo(g.zoneX - g.zoneW * 0.3, height);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(g.pitcher.x, g.pitcher.y, width * 0.06, height * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
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

  drawBall(g, progress) {
    const { ctx } = this;
    const { layout } = this.config;
    const x = g.pitcher.x + (g.arrival.x - g.pitcher.x) * progress;
    const y = g.pitcher.y + (g.arrival.y - g.pitcher.y) * progress;
    const scale = layout.ball_scale_start + (layout.ball_scale_end - layout.ball_scale_start) * progress;
    const r = layout.ball_radius * this.height * scale;
    ctx.fillStyle = COLORS.ball;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.seam;
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath();
    ctx.arc(x - r * 0.9, y, r * 0.75, -0.9, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + r * 0.9, y, r * 0.75, Math.PI - 0.9, Math.PI + 0.9);
    ctx.stroke();
  }

  drawTrail(swing) {
    const { ctx } = this;
    ctx.strokeStyle = COLORS.trail;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(swing.start.x, swing.start.y);
    ctx.lineTo(swing.end.x, swing.end.y);
    ctx.stroke();
  }

  drawText(width, height) {
    const { ctx } = this;
    const base = Math.max(14, Math.min(width, height) * 0.035);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = COLORS.text;
    ctx.font = `${base}px system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    ctx.fillText('위로 쓸기: 어퍼 · 옆으로: 레벨 · 아래로: 다운', width / 2, height - base * 1.4);

    if (!this.lastResult) return;
    const { result, swingType, timingError, pitchHeight } = this.lastResult;
    ctx.fillStyle = GOOD_RESULTS.has(result) ? COLORS.good : COLORS.bad;
    ctx.font = `bold ${base * 2.6}px system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    ctx.fillText(RESULT_TEXT[result], width / 2, height * 0.1);

    ctx.fillStyle = COLORS.text;
    ctx.font = `${base}px system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    const detail = swingType
      ? `${HEIGHT_TEXT[pitchHeight]} · ${SWING_TEXT[swingType]} 스윙 · ${timingError >= 0 ? '늦음' : '빠름'} ${Math.abs(timingError).toFixed(3)}초`
      : HEIGHT_TEXT[pitchHeight];
    ctx.fillText(detail, width / 2, height * 0.1 + base * 2.4);
  }
}
