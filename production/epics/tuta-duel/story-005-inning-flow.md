# Story 005: 이닝 진행 — 아웃·주자·점수·공수 교대

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Core
> **Type**: Logic
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 5`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 5, Player goal & fail state):*

- [ ] 아웃(삼진, 땅볼, 뜬공)은 아웃 카운트를 1 올린다
- [ ] 볼넷과 안타는 타자를 1루로, 2루타는 2루로, 홈런은 홈으로 보내고, 주자는 같은 수만큼 진루한다 (볼넷은 밀어내기만)
- [ ] 홈을 밟은 주자마다 공격 팀 점수가 1 오른다
- [ ] 3아웃이면 주자를 비우고 공수를 바꾼다: 초 = 플레이어 공격 / CPU 수비, 말 = CPU 공격 / 플레이어 수비
- [ ] 말 공격이 끝나면 점수를 비교해 승리 / 패배 / 무승부를 정한다
- [ ] 이닝 상태 머신은 노드 없이 단위 테스트할 수 있다

---

## Implementation Notes

- `InningState`: 아웃, 주자(3칸 bool), 점수 2개, 초/말, 종료 여부
- 공수 교대 시 조작기를 바꿔 끼운다 (Story 003 구조)
- 이 단계는 1이닝 고정이며, 이닝 수는 설정값으로 둔다

---

## Out of Scope

- 수비, 주루 조작, 태그업, 병살 (brief Out of scope)
- Story 006: 화면 표시

---

## Files

- `src/rules/inning_state.gd`
- `src/game/match_flow.gd`, `src/game/match.tscn`
- `tests/unit/game_flow/inning_state_test.gd`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Logic
**Required evidence**: `tests/unit/game_flow/inning_state_test.gd` (advisory)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-003-controllers-cpu-ai.md`, `production/epics/tuta-duel/story-004-player-pitching.md`
- Unlocks: `production/epics/tuta-duel/story-006-hud-screens.md`
