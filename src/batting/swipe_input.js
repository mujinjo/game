// Swipe-to-swing input (design/game-brief.md MVP 2, story-001-swipe-swing-batting).
// Mouse drags and touch swipes both arrive as Pointer Events. The swing time is
// the moment the pointer goes down; the swing type is known once the pointer has
// moved far enough, or on release (a tap is a level swing).

/**
 * Classifies a pointer movement as a swing type.
 * @param {number} dx Horizontal movement in px.
 * @param {number} dy Vertical movement in px (screen coordinates: positive = down).
 * @param {object} swipeConfig config.swipe
 * @returns {string|null} 'upper' | 'level' | 'down', or null while still too short to tell.
 */
export function classifySwipe(dx, dy, swipeConfig) {
  if (Math.hypot(dx, dy) < swipeConfig.min_distance_px) return null;
  const angleFromHorizontal = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
  if (angleFromHorizontal < swipeConfig.level_angle_deg) return 'level';
  return dy < 0 ? 'upper' : 'down';
}

/**
 * Listens for swipes on an element and reports one swing per gesture.
 */
export class SwipeInput {
  /**
   * @param {HTMLElement} element Element that receives pointer events.
   * @param {object} swipeConfig config.swipe
   * @param {(swing: {swingType: string, time: number, start: {x: number, y: number}, end: {x: number, y: number}}) => void} onSwing
   *   Called once per gesture. `time` is the pointerdown timestamp (same clock as performance.now()).
   */
  constructor(element, swipeConfig, onSwing) {
    this.element = element;
    this.swipeConfig = swipeConfig;
    this.onSwing = onSwing;
    this.gesture = null;
    element.addEventListener('pointerdown', (e) => this.handleDown(e));
    element.addEventListener('pointermove', (e) => this.handleMove(e));
    element.addEventListener('pointerup', (e) => this.handleUp(e));
    element.addEventListener('pointercancel', () => { this.gesture = null; });
  }

  /** True while a pointer is down and its swing type is not yet known. */
  get isPending() {
    return this.gesture !== null && !this.gesture.committed;
  }

  handleDown(event) {
    if (!event.isPrimary) return;
    this.element.setPointerCapture?.(event.pointerId);
    const point = this.toLocal(event);
    this.gesture = { time: event.timeStamp, start: point, end: point, committed: false };
  }

  handleMove(event) {
    if (!this.isPending || !event.isPrimary) return;
    const point = this.toLocal(event);
    this.gesture.end = point;
    const swingType = classifySwipe(point.x - this.gesture.start.x, point.y - this.gesture.start.y, this.swipeConfig);
    if (swingType) this.commit(swingType);
  }

  handleUp(event) {
    if (!this.isPending || !event.isPrimary) {
      this.gesture = null;
      return;
    }
    this.gesture.end = this.toLocal(event);
    this.commit('level');
    this.gesture = null;
  }

  commit(swingType) {
    this.gesture.committed = true;
    const { time, start, end } = this.gesture;
    this.onSwing({ swingType, time, start, end });
  }

  toLocal(event) {
    const rect = this.element.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
}
