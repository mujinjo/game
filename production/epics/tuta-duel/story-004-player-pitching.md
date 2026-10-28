# Story 004: 플레이어 투구 조작

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Core
> **Type**: Integration
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 3`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 3, Core loop 1):*

- [ ] 플레이어가 투수일 때 구종 버튼 3개(직구 / 커브 / 체인지업)를 클릭·터치로 고를 수 있다
- [ ] 존 위(존 밖 포함)를 클릭·터치해 코스를 정하면 투구가 시작된다
- [ ] 투구는 Story 002 궤적을 그대로 쓰며, 제구 오차가 적용된다
- [ ] CPU 타자(Story 003)가 그 공에 반응하고, 결과가 카운트에 반영된다
- [ ] 투구 중에는 다음 입력을 받지 않는다
- [ ] 여기까지 구현되면 플레이어 투수 vs CPU 타자로 한 타석을 끝까지 플레이할 수 있다

---

## Implementation Notes

- `HumanPitcher`는 `PitcherController`를 구현하고, UI에서 받은 선택을 신호로 내보낸다
- 마우스와 터치 모두 한 번의 탭으로 동작해야 한다 (호버 전용 동작 금지)

---

## Out of Scope

- Story 005: 공수 교대에 따른 자동 역할 전환
- Story 006: 정식 HUD 스타일

---

## Files

- `src/controllers/human_pitcher.gd`
- `src/pitching/pitch_select_ui.gd`, `src/pitching/pitch_select_ui.tscn`
- `tests/integration/pitching/player_pitch_test.gd`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Integration
**Required evidence**: `tests/integration/pitching/player_pitch_test.gd` OR playtest doc (advisory); retained screenshot of the pitch-select screen in `production/qa/evidence/`

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-002-pitch-trajectory-strike-zone.md`, `production/epics/tuta-duel/story-003-controllers-cpu-ai.md`
- Unlocks: `production/epics/tuta-duel/story-005-inning-flow.md`
