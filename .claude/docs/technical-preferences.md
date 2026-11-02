# Technical Preferences

<!-- project.yaml at the repo root is the machine-readable source of truth for
     engine, specialists, naming, performance, platform, and testing.framework.
     This file is the human-readable LEGACY FALLBACK: agents and skills resolve
     each key from project.yaml first and fall back here only when the
     project.yaml key is absent. /setup-engine dual-writes both.
     Forbidden patterns and allowed libraries are NOT migrated — they live only
     in this file. Populated by /setup-engine; updated as decisions are made. -->

## Engine & Language

- **Engine**: None — Web (HTML5 Canvas 2D, no engine)
- **Language**: JavaScript (ES modules, no framework)
- **Rendering**: Canvas 2D (revisit — e.g. Three.js — if the game moves to 3D)
- **Physics**: None (ball flight is scripted)

## Input & Platform

<!-- Written by /setup-engine. Read by /ux-design, /ux-review, /test-setup, /team-ui, and /dev-story -->
<!-- to scope interaction specs, test helpers, and implementation to the correct input methods. -->

- **Target Platforms**: PC, Mobile
- **Input Methods**: Mouse, Touch, Gamepad (partial)
- **Primary Input**: Mouse
- **Gamepad Support**: Partial
- **Touch Support**: Full
- **Platform Notes**: Every mouse action must map to a single tap — no hover-only or right-click-only interactions.

## Naming Conventions

- **Classes**: PascalCase (e.g., `BatterView`)
- **Variables**: camelCase (e.g., `ballSpeed`)
- **Signals/Events**: callback props named `on<Event>` (e.g., `onSwingResolved`)
- **Files**: snake_case (e.g., `swing_judge.js`)
- **Scenes/Prefabs**: n/a — views are JS modules
- **Constants**: UPPER_SNAKE_CASE (e.g., `SWING_TYPES`)

## Performance Budgets

- **Target Framerate**: 60 fps
- **Frame Budget**: 16.6 ms
- **Draw Calls**: [TO BE CONFIGURED]
- **Memory Ceiling**: [TO BE CONFIGURED]

## Testing

- **Framework**: Node built-in test runner (`node --test 'tests/**/*_test.js'`)
- **Minimum Coverage**: [TO BE CONFIGURED]
- **Required Tests**: Balance formulas, gameplay systems, networking (if applicable)

## Forbidden Patterns

<!-- Add patterns that should never appear in this project's codebase -->
- [None configured yet — add as architectural decisions are made]

## Allowed Libraries / Addons

<!-- Add approved third-party dependencies here -->
- [None configured yet — add as dependencies are approved]

## Architecture Decisions Log

<!-- Quick reference linking to full ADRs in docs/architecture/ -->
- [No ADRs yet — use /architecture-decision to create one]

## Engine Specialists

<!-- No engine: the game is plain browser JavaScript. -->

- **Primary**: gameplay-programmer
- **Language/Code Specialist**: gameplay-programmer (all .js files)
- **Shader Specialist**: technical-artist
- **UI Specialist**: ui-programmer
- **Additional Specialists**: none
- **Routing Notes**: No engine specialist applies. Use gameplay-programmer for game logic, ui-programmer for HUD/screens.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.js files) | gameplay-programmer |
| Shader / material files | technical-artist |
| UI / screen files (HUD, screens) | ui-programmer |
| Data files (.json) | gameplay-programmer |
| General architecture review | lead-programmer |
