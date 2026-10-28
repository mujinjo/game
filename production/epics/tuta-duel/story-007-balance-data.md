# Story 007: 밸런스 데이터 완성 + 난이도 프리셋

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Core
> **Type**: Config/Data
> **Estimate**: S
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 7`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 7):*

- [ ] 공 속도, 조준 판정 반경, 타이밍 판정 구간, 구종 변화량, 제구 오차, AI 확률이 모두 데이터 파일에 있다
- [ ] `src/` 아래 게임플레이 수치 하드코딩이 남아 있지 않다 (검색으로 확인)
- [ ] CPU 난이도 프리셋 3개(쉬움 / 보통 / 어려움)가 데이터 파일로 존재하고, 기본값은 "보통"이다
- [ ] 데이터 파일만 바꿔도 게임 재시작 시 수치가 반영된다
- [ ] 스모크 체크를 통과한다

---

## Implementation Notes

- Story 001에서 만든 `BalanceConfig`를 확장한다
- 난이도 선택 UI는 MVP 밖 — 프리셋 경로는 설정값으로 지정

---

## Out of Scope

- 난이도 선택 화면

---

## Files

- `src/config/balance_config.gd`
- `assets/data/balance_default.tres`
- `assets/data/difficulty/easy.tres`, `normal.tres`, `hard.tres`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — advisory.*

**Story Type**: Config/Data
**Required evidence**: smoke check pass (`production/qa/smoke-*.md`)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-006-hud-screens.md`
- Unlocks: None
