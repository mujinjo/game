# Story 006: HUD + 시작/결과 화면

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Presentation
> **Type**: UI
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 6`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 6, Player goal & fail state):*

- [ ] HUD에 볼 / 스트라이크 / 아웃, 주자 다이아몬드, 양 팀 점수, 초/말이 항상 보인다
- [ ] 투구 결과(스트라이크, 볼, 안타, 홈런 등)가 잠시 크게 표시된다
- [ ] 시작 화면에 모드 선택이 있고 "vs CPU"만 활성화돼 있다 (2인 대전 버튼은 비활성 + "준비 중")
- [ ] 결과 화면에 최종 점수와 승리 / 패배 / 무승부, "다시 하기" 버튼이 있다
- [ ] 모든 버튼은 마우스 클릭과 터치 한 번으로 동작한다
- [ ] 화면 비율 16:9(PC)와 세로형 모바일 해상도에서 UI가 잘리지 않는다

---

## Implementation Notes

- HUD는 `InningState`의 신호만 구독해 표시한다 (로직을 들고 있지 않는다)
- Main scene을 시작 화면으로 지정한다 (`project.godot` `run/main_scene`)

---

## Out of Scope

- 2인 대전 모드 동작
- 사운드 (brief Art & audio는 방향만 정의, MVP 밖)

---

## Files

- `src/ui/hud.gd`, `src/ui/hud.tscn`
- `src/ui/title_screen.gd`, `src/ui/title_screen.tscn`
- `src/ui/result_screen.gd`, `src/ui/result_screen.tscn`
- `project.godot`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*Not waived at `qa.level: minimal`.*

**Story Type**: UI
**Required evidence**: retained screenshots of the title screen, the in-game HUD, and the result screen in `production/qa/evidence/`

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-005-inning-flow.md`
- Unlocks: `production/epics/tuta-duel/story-007-balance-data.md`
