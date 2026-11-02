# Story 008: 투수·타자 그래픽 + 애니메이션

> **Epic**: 싸발적인 투타대결
> **Status**: In Progress
> **Layer**: Presentation
> **Type**: Visual/Feel
> **Estimate**: M
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-02

## Context

**GDD**: `design/game-brief.md`
**Requirement**: `Brief Art & audio direction` (플랫 2D 벡터, 포수 뒤 시점) — added after the MVP list at the user's request

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web (Canvas 2D, no engine) | **Risk**: LOW
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From `design/game-brief.md` (Art & audio direction, Core loop):*

- [ ] 투수가 마운드 위에 플랫 벡터로 그려지고, 투구마다 와인드업 → 릴리스 → 팔로스루 동작을 한다
- [ ] 공은 투수의 릴리스 순간 손 위치에서 출발한다 (타이밍 판정의 기준 시각도 릴리스 순간)
- [ ] 타자가 포수 뒤 시점의 뒷모습으로 화면 앞쪽에 그려지며, 스트라이크존을 가리지 않는다
- [ ] 타자는 대기 자세에서 배트를 들고 있고, 스윙하면 어퍼 / 레벨 / 다운이 서로 다른 궤적으로 휘둘러진다 (어퍼는 낮은 칸, 레벨은 가운데, 다운은 높은 칸을 지난다)
- [ ] 결과에 따라 타구가 다르게 날아간다: 홈런은 멀리 높이, 안타·2루타는 외야로, 땅볼은 땅으로, 뜬공은 높이 떴다가 멈추고, 파울은 옆으로, 헛스윙·노스윙은 포수 쪽으로 지나간다
- [ ] 캐릭터 크기·위치와 애니메이션 시간은 `assets/data/balance_default.json`에서 읽는다
- [ ] PC(1280×720)와 세로 모바일(390×844) 화면에서 캐릭터와 존이 모두 보인다

---

## Implementation Notes

- 그리기는 `src/view/` 아래의 순수 함수로 분리한다. 포즈 계산(관절 위치)은 진행률과 스윙 종류만으로 정해진다.
- 투구는 `windup` 상태를 새로 두고, 와인드업이 끝나는 순간을 `pitchStart`로 삼는다.
- 기존 스와이프 궤적 선은 배트 애니메이션으로 대체한다.

---

## Out of Scope

- 구종별 투구 폼 차이 (Story 002 이후)
- 수비수, 관중, 사운드

---

## Files

- `src/view/pose_math.js`
- `src/view/pitcher_sprite.js`
- `src/view/batter_sprite.js`
- `src/batting/batter_view.js`
- `src/config/balance_config.js`
- `assets/data/balance_default.json`

## QA Test Cases

*N/A — no qa-lead specs at this tier; implement against the Acceptance Criteria above*

---

## Test Evidence

*Not waived at `qa.level: minimal`.*

**Story Type**: Visual/Feel
**Required evidence**: retained screenshots in `production/qa/evidence/story-008-pitcher-batter-graphics/` + sign-off in `production/qa/evidence/story-008-pitcher-batter-graphics-evidence.md`

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/tuta-duel/story-001-swipe-swing-batting.md`
- Unlocks: None
