# Epic: 싸발적인 투타대결

> **Layer**: Core
> **Workflow tier**: minimal — traced to `design/game-brief.md`, no GDD / ADRs

## Goal

포수 뒤 시점에서 날아오는 공을 마우스로 조준해 한 번의 클릭으로 받아치고, 공수를 바꿔 CPU 타자를 잡아내는 1이닝 투타 대결.

## Scope (Brief MVP)

1. 투구 궤적과 스트라이크존 판정
2. 마우스 조준과 클릭 타이밍 타격
3. 플레이어 투구 (구종 3개 + 코스 클릭)
4. 사람 / CPU 조작기 구조와 CPU AI
5. 이닝 진행 (아웃, 주자, 점수, 공수 교대)
6. HUD와 시작 / 결과 화면
7. 밸런스 수치 외부 데이터화

## Order

The brief's Build order: batting first (proves the fun), then count and judgement, CPU pitcher, player pitching and CPU batter, inning flow, HUD and data.

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | 마우스 조준 + 클릭 타이밍 타격 | Logic | Ready | N/A (minimal) |
| 002 | 투구 궤적 + 스트라이크존 판정 | Logic | Ready | N/A (minimal) |
| 003 | 사람/CPU 조작기 구조 + CPU 투수·타자 AI | Logic | Ready | N/A (minimal) |
| 004 | 플레이어 투구 조작 | Integration | Ready | N/A (minimal) |
| 005 | 이닝 진행 — 아웃·주자·점수·공수 교대 | Logic | Ready | N/A (minimal) |
| 006 | HUD + 시작/결과 화면 | UI | Ready | N/A (minimal) |
| 007 | 밸런스 데이터 완성 + 난이도 프리셋 | Config/Data | Ready | N/A (minimal) |
