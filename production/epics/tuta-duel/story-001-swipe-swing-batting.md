# Story 001: 스와이프 스윙 + 타이밍 타격

> **Epic**: 싸발적인 투타대결
> **Status**: In Progress
> **Layer**: Core
> **Type**: Logic
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-02

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 2`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web (Canvas 2D, no engine) | **Risk**: LOW
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 2, Core loop, Build order 1):*

- [ ] 포수 뒤 시점에서 공이 투수 위치부터 홈플레이트까지 날아오며, 다가올수록 커진다 (이 스토리는 직구 한 종류)
- [ ] 공은 높음 / 가운데 / 낮음 중 한 높이로 들어오고, 플레이어가 날아오는 도중 높이를 읽을 수 있다
- [ ] 마우스 드래그나 터치 스와이프의 방향으로 스윙 종류가 정해진다: 위 = 어퍼, 옆 = 레벨, 아래 = 다운. 최소 거리보다 짧은 입력(탭)은 레벨 스윙이다
- [ ] 스와이프를 시작한 순간이 스윙 타이밍이며, 한 투구당 스윙은 한 번만 가능하다
- [ ] 판정은 타이밍 오차, 스윙 종류, 공 높이 세 값으로만 계산하는 순수 함수다 (DOM·Canvas 없이 테스트 가능)
- [ ] 이상적인 짝(낮음–어퍼, 가운데–레벨, 높음–다운)일수록, 타이밍 오차가 작을수록 결과가 좋아진다. 결과는 헛스윙 / 파울 / 땅볼 아웃 / 뜬공 아웃 / 안타 / 2루타 / 홈런 중 하나다
- [ ] 스윙하지 않으면 결과는 "노스윙"이다 (볼/스트라이크 판정은 Story 002)
- [ ] 결과가 화면에 텍스트로 표시되고, 다음 공이 자동으로 던져진다
- [ ] 공 속도, 타이밍 판정 구간, 스와이프 최소 거리, 결과표는 `assets/data/balance_default.json`에서 읽는다 (하드코딩 금지)

---

## Implementation Notes

- `judgeSwing({ timingError, swingType, pitchHeight }, config)`는 순수 함수다. 타이밍 등급 → 궁합 보정 → 결과표 조회 순서로 판정한다.
- 궁합: 이상적인 짝이면 등급 그대로, 한 칸 어긋나면 한 등급 낮춤, 정반대(높음–어퍼, 낮음–다운)면 굿 이상은 파울, 그 외는 헛스윙.
- 스와이프 판별(`classifySwipe`)도 순수 함수로 분리한다. 방향 판정은 시작점과 이동 벡터의 각도로 한다.
- 화면 연출은 판정 결과만 받아 표시한다. 공 위치는 "진행률 0~1 + 도착 좌표"로 모델링해 3D 전환에 대비한다.
- 마우스와 터치는 Pointer Events(`pointerdown` / `pointermove` / `pointerup`) 하나로 처리한다.

---

## Out of Scope

- Story 002: 구종, 스트라이크존, 볼카운트
- Story 003: CPU 투수 AI (여기서는 고정 간격으로 직구를 던진다)
- Story 006: 정식 HUD

---

## Files

- `index.html`
- `package.json`
- `src/main.js`
- `src/config/balance_config.js`
- `src/batting/swing_judge.js`
- `src/batting/swipe_input.js`
- `src/batting/batter_view.js`
- `assets/data/balance_default.json`
- `tests/unit/batting/swing_judge_test.js`

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Logic
**Required evidence**: `tests/unit/batting/swing_judge_test.js` (advisory); retained screenshot of the batting view in `production/qa/evidence/story-001-swipe-swing-batting/` (player-observable change)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: None
- Unlocks: `production/epics/tuta-duel/story-002-pitch-trajectory-strike-zone.md`
