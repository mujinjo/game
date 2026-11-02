// Entry point: loads the balance data and starts the batting view
// (story-001-swipe-swing-batting).

import { loadBalanceConfig } from './config/balance_config.js';
import { BatterView } from './batting/batter_view.js';

const canvas = document.getElementById('game');
const message = document.getElementById('message');

try {
  const config = await loadBalanceConfig();
  const view = new BatterView(canvas, config);
  view.start();
  window.batterView = view; // exposed for debugging and automated screenshots
} catch (error) {
  message.hidden = false;
  message.textContent = `게임을 불러오지 못했어요: ${error.message} — 로컬 서버(python3 -m http.server)로 열어 주세요.`;
}
