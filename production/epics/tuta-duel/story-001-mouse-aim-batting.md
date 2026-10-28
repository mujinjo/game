# Story 001: 마우스 조준 + 클릭 타이밍 타격

> **Epic**: 싸발적인 투타대결
> **Status**: In Progress
> **Layer**: Core
> **Type**: Logic
> **Estimate**: L
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-10-28

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 2`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 2, Core loop, Build order 1):*

- [ ] 포수 뒤 시점에서 공이 투수 위치부터 홈플레이트까지 날아오며, 다가올수록 커진다 (이 스토리는 직구 한 종류)
- [ ] 마우스 위치를 따라 조준 원이 스트라이크존 위를 움직인다
- [ ] 좌클릭(또는 터치)으로 스윙하며, 한 투구당 스윙은 한 번만 가능하다
- [ ] 판정은 조준 오차(조준 원 중심 ↔ 공 도착 위치)와 타이밍 오차(클릭 시각 ↔ 공 도착 시각) 두 값으로만 계산하는 순수 함수다
- [ ] 판정 결과는 헛스윙 / 파울 / 아웃(땅볼·뜬공) / 안타 / 2루타 / 홈런 중 하나다. 두 오차가 모두 작을수록 결과가 좋아진다
- [ ] 스윙하지 않으면 결과는 "노스윙"이다 (볼/스트라이크 판정은 Story 002)
- [ ] 결과가 화면에 텍스트로 표시되고, 다음 공을 던질 수 있다
- [ ] 공 속도, 조준 판정 반경, 타이밍 판정 구간은 밸런스 설정 Resource에서 읽는다 (하드코딩 금지)

---

## Implementation Notes

- 판정 로직(`SwingJudge`)은 노드와 분리된 순수 클래스로 만든다. 입력은 오차 두 개와 설정, 출력은 결과 enum이다.
- 화면 연출 노드는 판정 결과만 받아 표시한다.
- 2D 원근감은 공 스케일 보간으로 표현한다. 3D 전환을 고려해 공 위치는 "진행률 0~1 + 도착 좌표"로 모델링한다.
- 입력은 InputEvent의 마우스 버튼과 터치 이벤트를 모두 처리한다.

---

## Out of Scope

- Story 002: 구종, 스트라이크존, 볼카운트
- Story 003: CPU 투수 AI (여기서는 고정 간격으로 직구를 던진다)
- Story 006: 정식 HUD

---

## Files

- `src/batting/swing_judge.gd`
- `src/batting/batter_view.gd`, `src/batting/batter_view.tscn`
- `src/config/balance_config.gd`, `assets/data/balance_default.tres`
- `tests/unit/batting/swing_judgement_test.gd`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Logic
**Required evidence**: `tests/unit/batting/swing_judgement_test.gd` (advisory); retained screenshot of the batting view in `production/qa/evidence/` (player-observable change)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: None
- Unlocks: `production/epics/tuta-duel/story-002-pitch-trajectory-strike-zone.md`
