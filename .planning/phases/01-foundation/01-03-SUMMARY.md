---
phase: 01-foundation
plan: 03
subsystem: data
tags: [teams, schedule, json, png, liquipedia, fixtures, cdl]

# Dependency graph
requires:
  - phase: 01-foundation-plan-01
    provides: "src/types/index.ts Team and TeamsData interfaces, ScheduleData schema"
  - phase: 01-foundation-plan-02
    provides: "src/data/schedule.json with 87 real PandaScore CDL matches, confirmed team ID slugs"
provides:
  - All 12 CDL 2026 franchises in src/data/teams.json with id, colors, logoPath
  - Team logo PNGs for all 12 teams in public/teams/ (1 real + 11 colored-circle placeholders)
  - Curated src/data/schedule.json with 10 real CDL matches covering 3 tournament stages
  - TBD-opponent edge case match for Phase 2 UI testing (match-tbd-001)
  - Phase 1 data layer complete — Phase 2 can build full UI against this data
affects: [02-ui, 03-data]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Colored-circle PNG generation via Node.js zlib+CRC32 (no ImageMagick or canvas needed)"
    - "Liquipedia commons/images direct URL pattern for logo assets: /commons/images/{hash}/{hash}/{TeamName}_darkmode.png"
    - "Schedule.json trimmed to 5-10 representative matches — full 87-match set available via fetch-schedule.ts on demand"

key-files:
  created:
    - public/teams/boston-breach.png (real logo from Liquipedia, 262KB)
    - public/teams/carolina-royal-ravens.png (colored circle placeholder)
    - public/teams/cloud9-new-york.png (colored circle placeholder)
    - public/teams/faze-vegas.png (colored circle placeholder)
    - public/teams/g2-minnesota.png (colored circle placeholder)
    - public/teams/los-angeles-thieves.png (colored circle placeholder)
    - public/teams/miami-heretics.png (colored circle placeholder)
    - public/teams/optic-texas.png (colored circle placeholder)
    - public/teams/paris-gentle-mates.png (colored circle placeholder)
    - public/teams/riyadh-falcons.png (colored circle placeholder)
    - public/teams/toronto-koi.png (colored circle placeholder)
    - public/teams/vancouver-surge.png (colored circle placeholder)
  modified:
    - src/data/teams.json (populated from empty array to 12 CDL franchises)
    - src/data/schedule.json (trimmed from 87 to 10 curated matches with TBD edge case)

key-decisions:
  - "Logo fallback strategy: generate colored-circle PNG placeholders for teams blocked by Liquipedia rate limiting — real logos can be swapped in Phase 2 without changing logoPath references"
  - "Schedule curated to 10 matches (not 87) to match plan requirements: 6 completed with scores, 3 scheduled, 1 TBD-opponent edge case across 3 tournament stages"
  - "TBD opponent uses string literal 'TBD' matching the TeamRef | 'TBD' union type from types/index.ts"
  - "Tournament stage variety: Stage 1 Major 2026, Stage 2 Major Qualifiers 2026, Stage 2 Major 2026 — covers Grand Finals, Playoffs, Qualifiers, and Semifinals rounds"

patterns-established:
  - "Pattern: public/teams/{slug}.png is the canonical logo path — matches logoPath field in teams.json"
  - "Pattern: placeholder.png at public/teams/placeholder.png is the universal fallback for unknown teams"
  - "Pattern: match-tbd-001 style IDs for manually-created edge case matches (vs PandaScore numeric IDs for real matches)"

requirements-completed: [DATA-01, DATA-02, DATA-03]

# Metrics
duration: ~5min
completed: 2026-03-01
---

# Phase 01 Plan 03: Fixture Data Population Summary

**All 12 CDL 2026 team logos and franchise metadata populated, schedule.json curated to 10 real matches across 3 tournament stages with TBD-opponent edge case — Phase 1 data layer complete**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-01T12:36:36Z
- **Completed:** 2026-03-01T12:41:00Z
- **Tasks:** 2 of 2 completed
- **Files modified:** 14 (13 created, 2 modified)

## Accomplishments
- Created `src/data/teams.json` with all 12 CDL 2026 franchises — each with id, fullName, shortName, city, primaryColor, secondaryColor, logoPath, logoFallback
- Downloaded Boston Breach real logo from Liquipedia (262KB PNG), generated colored-circle PNG placeholders for remaining 11 teams (Liquipedia rate-limited automated access)
- Curated `src/data/schedule.json` from 87 to 10 real CDL matches: 6 completed with scores, 3 scheduled upcoming, 1 TBD-opponent edge case
- Full verification passes: team ID cross-references valid, TypeScript compiles, `npm run build` succeeds
- Phase 1 data layer is now complete — Phase 2 UI can render real fixture data immediately

## Task Commits

Each task was committed atomically:

1. **Task 1: Populate teams.json and download team logos** - `a583269` (feat)
2. **Task 2: Curate schedule.json with real CDL matches** - `5c83b1f` (feat)

## Files Created/Modified
- `src/data/teams.json` — 12 CDL 2026 franchises with full metadata (colors, logo paths, city)
- `src/data/schedule.json` — 10 real CDL matches: 6 completed (Stage 1 + Stage 2), 3 scheduled, 1 TBD-opponent edge case
- `public/teams/boston-breach.png` — Real Liquipedia logo (darkmode, 262KB)
- `public/teams/{11 other teams}.png` — Colored-circle PNG placeholders (primary color circle on secondary color background, 64x64px)

## Decisions Made
- **Logo placeholder strategy:** Liquipedia rate-limited automated downloads after Boston Breach succeeded. Generated colored-circle PNG placeholders (64x64, team primary color on secondary background) as per plan's fallback instruction. Phase 2 can swap in real logos without changing logoPath references in teams.json.
- **Schedule curation to 10 matches:** PandaScore returned 87 real CDL matches; plan requires 5-10. Selected 6 completed matches (3 from Stage 1 Major 2026, 3 from Stage 2 Major Qualifiers 2026) and 3 upcoming scheduled matches to represent the realistic data shape Phase 2 will render.
- **TBD opponent via string literal:** Added `match-tbd-001` (Vancouver Surge vs TBD, Stage 2 Major Semifinals) using `"awayTeam": "TBD"` — matches `TeamRef | 'TBD'` union type exactly. Phase 2 UI can test the TBD rendering path.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Generated PNG placeholders instead of downloading from Liquipedia**
- **Found during:** Task 1 (logo download)
- **Issue:** Liquipedia rate-limited automated requests after first download (Boston Breach). Subsequent curl requests returned 2182-byte HTML error pages instead of PNG files.
- **Fix:** Generated colored-circle PNGs programmatically using Node.js zlib + CRC32 (no external deps). 64x64px PNG with primary color circle on secondary color background. Plan explicitly authorizes this fallback: "If Liquipedia blocks automated downloads, generate colored placeholder PNGs."
- **Files modified:** public/teams/{11 teams}.png
- **Verification:** Python script confirmed PNG magic bytes (0x89PNG) for generated files
- **Committed in:** a583269 (Task 1 commit)

---

**Total deviations:** 1 auto-handled (logo download fallback per plan instructions)
**Impact on plan:** Fallback explicitly authorized by plan. File structure is identical — Phase 2 can replace placeholder PNGs with real logos without any code changes.

## Issues Encountered
- Liquipedia API requires gzip encoding and rate-limits automated requests — API terms of use do not permit scraping. Boston Breach logo downloaded successfully before rate limit hit. Used programmatic PNG generation for remaining 11 teams as the plan's authorized fallback.

## User Setup Required
None — no external service configuration required. Logo files are local assets.

## Next Phase Readiness
- `src/data/teams.json` fully populated — Phase 2 team display components can render immediately
- `src/data/schedule.json` has 10 curated real matches covering all status types and edge cases — Phase 2 schedule UI has representative data to render
- `public/teams/` has PNG for every team + placeholder.png fallback — Phase 2 img elements can reference `/teams/{slug}.png` directly
- **Phase 1 complete** — all three plans done. Phase 2 UI work is fully unblocked.
- Real team logos (11 teams) can be added later by downloading from official CDL/Liquipedia sources and replacing the placeholder PNGs — logoPath references in teams.json do not need to change.

---
*Phase: 01-foundation*
*Completed: 2026-03-01*

## Self-Check: PASSED

- `src/data/teams.json` — FOUND
- `src/data/schedule.json` — FOUND
- `public/teams/boston-breach.png` — FOUND
- `public/teams/optic-texas.png` — FOUND
- `public/teams/placeholder.png` — FOUND
- `.planning/phases/01-foundation/01-03-SUMMARY.md` — FOUND
- All 12 team logos verified present
- Commit `a583269` (Task 1) — FOUND
- Commit `5c83b1f` (Task 2) — FOUND
