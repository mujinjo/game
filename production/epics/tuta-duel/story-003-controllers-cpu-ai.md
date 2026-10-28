# Story 003: 사람/CPU 조작기 구조 + CPU 투수·타자 AI

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Core
> **Type**: Logic
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 4`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 4, Out of scope: 2인 대전은 구조만):*

- [ ] 투수 조작기와 타자 조작기는 공통 인터페이스를 가지며, 사람 / CPU 구현을 갈아 끼워도 게임 로직은 바뀌지 않는다
- [ ] CPU 투수는 설정된 가중치에 따라 구종과 코스를 고르고, 카운트(예: 3볼)에 따라 존 안 비율을 높인다
- [ ] CPU 타자는 공의 도착 위치와 시각에 난이도별 오차를 더해 스윙 여부, 조준점, 스윙 시각을 정한다
- [ ] CPU 타자는 볼을 일정 확률로 골라내고, 스트라이크에 일정 확률로 반응한다 (확률은 설정값)
- [ ] 난수는 주입 가능한 RNG를 써서 테스트에서 결과가 결정적이다
- [ ] 여기까지 구현되면 CPU 투수 vs 플레이어 타자로 한 타석을 끝까지 플레이할 수 있다

---

## Implementation Notes

- `PitcherController` / `BatterController` 기반 클래스 + `Human*` / `Cpu*` 구현
- 조작기는 신호(signal)로 결정을 알리고, 게임 흐름은 어느 구현인지 모른다
- 2인 대전은 나중에 두 번째 `Human*` 구현(다른 입력 장치)을 꽂는 것으로 끝나야 한다

---

## Out of Scope

- Story 004: 사람 투수 입력 UI
- Story 007: 난이도 프리셋 데이터
- 2인 대전 모드 자체

---

## Files

- `src/controllers/pitcher_controller.gd`, `src/controllers/batter_controller.gd`
- `src/controllers/cpu_pitcher.gd`, `src/controllers/cpu_batter.gd`, `src/controllers/human_batter.gd`
- `tests/unit/ai/cpu_controller_test.gd`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Logic
**Required evidence**: `tests/unit/ai/cpu_controller_test.gd` (advisory)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-002-pitch-trajectory-strike-zone.md`
- Unlocks: `production/epics/tuta-duel/story-004-player-pitching.md`, `production/epics/tuta-duel/story-005-inning-flow.md`
