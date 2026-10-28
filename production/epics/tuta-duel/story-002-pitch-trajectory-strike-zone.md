# Story 002: 투구 궤적 + 스트라이크존 판정

> **Epic**: 싸발적인 투타대결
> **Status**: Ready
> **Layer**: Core
> **Type**: Logic
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief MVP feature 1`

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Godot 4.7 | **Risk**: HIGH
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (MVP 1, MVP 3):*

- [ ] 구종 3개(직구 / 커브 / 체인지업)가 각자의 속도와 휘는 양으로 날아온다
- [ ] 투구는 목표 코스(3×3 존 칸 또는 존 밖)와 제구 오차로 최종 도착 위치가 정해진다
- [ ] 도착 위치가 스트라이크존 안이면 스트라이크, 밖이면 볼로 판정한다 (노스윙 시)
- [ ] 헛스윙은 스트라이크, 파울은 2스트라이크 미만일 때만 스트라이크를 올린다
- [ ] 4볼이면 볼넷, 3스트라이크면 삼진으로 타석이 끝나고 카운트가 초기화된다
- [ ] 볼카운트 로직은 노드 없이 단위 테스트할 수 있다
- [ ] 구종별 속도·변화량과 제구 오차는 밸런스 설정에서 읽는다

---

## Implementation Notes

- `PitchType` 데이터(Resource): 속도, 수평·수직 변화량
- `PitchTrajectory`: 진행률 0~1 → 화면 좌표. Story 001의 공 모델을 대체한다.
- `AtBatCount`: 공 하나의 결과를 받아 카운트를 갱신하고, 타석 종료 여부와 이유를 반환한다.

---

## Out of Scope

- Story 003: 어떤 구종과 코스를 던질지 고르는 AI
- Story 004: 플레이어 투구 입력
- Story 005: 주자와 점수

---

## Files

- `src/pitching/pitch_type.gd`, `assets/data/pitches/*.tres`
- `src/pitching/pitch_trajectory.gd`
- `src/rules/at_bat_count.gd`
- `tests/unit/pitching/strike_zone_test.gd`

---

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*`qa.level: minimal` — tests are advisory.*

**Story Type**: Logic
**Required evidence**: `tests/unit/pitching/strike_zone_test.gd` (advisory); retained screenshot showing a breaking pitch in `production/qa/evidence/`

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-001-mouse-aim-batting.md`
- Unlocks: `production/epics/tuta-duel/story-003-controllers-cpu-ai.md`, `production/epics/tuta-duel/story-004-player-pitching.md`
