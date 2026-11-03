# Evidence: Story 008 — 투수·타자 그래픽 + 애니메이션

**Captured:** 2026-11-02, Chromium (Playwright), game clock frozen per frame
**Screens:** desktop 1280×720, mobile 390×844 — images in `story-008-pitcher-batter-graphics/`

| Frame | What it shows |
|---|---|
| 01-windup-leg-lift | Pitcher lifts the front leg, hands together at the chest |
| 02-windup-cocked | Stride, throwing arm cocked back, glove arm out |
| 03-ball-in-flight | Ball leaves the release hand; pitcher in follow-through; batter in side stance (chest to the plate, helmet toward the pitcher) |
| 04-contact-upper-low | Upper swing: bat crosses the low row at contact, ball on the barrel |
| 05-contact-level-middle | Level swing: bat crosses the middle row |
| 06-contact-down-high | Down swing: bat crosses the high row |
| 07-home-run-flight | Batted ball rising and shrinking toward the outfield |
| 08-foul-flight | Opposite swing (upper on a high pitch) — judged foul, ball flies to the side |

Live run (real clock, 3 mouse swipes at 1280×720): all judged, no page errors.

**Feel (DEFERRED to playtest):** swing speed (0.3 s), windup length (0.9 s) and flight timing need hands-on play; a still cannot show them.

**Known look issues:** the result text overlaps the distant pitcher on desktop; the batter is partly cut off at the left edge on portrait phones. Both are left for Story 006 (HUD layout).

**Sign-off:** pending — user to confirm the look.
