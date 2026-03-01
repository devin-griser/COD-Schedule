---
phase: 02-schedule-display
plan: 02
subsystem: ui
tags: [react, typescript, tailwind, css-custom-properties, components]

# Dependency graph
requires:
  - phase: 02-schedule-display
    plan: 01
    provides: TypeScript types (Match, Team, TeamRef, MatchStatus), dateHelpers (formatMatchTime), dark theme, Inter font

provides:
  - src/components/TeamLogo.tsx — Team logo img with onError fallback and errored guard (no infinite loop)
  - src/components/TeamSlot.tsx — Team logo + name with CSS custom property color accent, handles TBD and null
  - src/components/MatchCard.tsx — Full match card as tappable anchor, tournament context, score/time/LIVE center
  - src/components/SkeletonCard.tsx — Loading placeholder card with animate-pulse
  - src/components/ErrorState.tsx — Error display with retry hint

affects: [02-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS custom property --team-color via style prop + border-(--team-color) className (Tailwind v4 pattern)
    - typeof string check for TeamRef | 'TBD' union type discrimination (no .id access on string)
    - onError errored-guard pattern to prevent infinite fallback loop on broken logos
    - animate-pulse on skeleton container for loading state

key-files:
  created:
    - src/components/TeamLogo.tsx
    - src/components/TeamSlot.tsx
    - src/components/MatchCard.tsx
    - src/components/SkeletonCard.tsx
    - src/components/ErrorState.tsx
  modified: []

key-decisions:
  - "Entire MatchCard is an <a> element (not a div with onClick) — whole card is tappable, locked user decision"
  - "CSS custom property --team-color via style prop for dynamic team colors — Tailwind v4 pattern, not dynamic class interpolation which is purged at build time"
  - "typeof string check for TBD guard — prevents .id access crash on 'TBD' string"
  - "errored boolean guard in TeamLogo — prevents infinite re-render loop if fallback logo also 404s"
  - "homeWins is null (not false) when not completed — enables ternary dimming without false positive on unplayed matches"

requirements-completed: [SCHED-04, SCHED-06, SCHED-07, DSGN-02, DSGN-03]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 2 Plan 02: Match Display Components Summary

**5 self-contained match display components (TeamLogo, TeamSlot, MatchCard, SkeletonCard, ErrorState) with tappable anchor cards, dynamic team color accents via CSS custom properties, TBD handling, and loading/error states**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T13:57:21Z
- **Completed:** 2026-03-01T13:58:44Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 5 component files created with correct named exports and zero TypeScript errors
- MatchCard is a full `<a>` element — whole card tappable per locked user decision
- Team color accents use `--team-color` CSS custom property (Tailwind v4 pattern, build-safe)
- TBD opponent handled via `typeof string` check without runtime crash
- TeamLogo errored-guard prevents infinite re-render loop on missing logos
- Completed match cards show winner bright / loser dimmed via `opacity-50`
- SkeletonCard mirrors MatchCard layout structure with `animate-pulse`
- Vite production build succeeds (217 kB JS, 12 kB CSS)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TeamLogo and TeamSlot components** - `7a62e04` (feat)
2. **Task 2: Create MatchCard, SkeletonCard, and ErrorState components** - `c86b00f` (feat)

## Files Created/Modified

- `src/components/TeamLogo.tsx` — img with onError fallback + errored guard to prevent infinite loop
- `src/components/TeamSlot.tsx` — team logo + shortName with --team-color CSS custom property accent; handles TBD, null team, dimmed state, away-side reverse layout
- `src/components/MatchCard.tsx` — `<a>` root element, tournament context row, TeamSlot x2, score/time/LIVE center column
- `src/components/SkeletonCard.tsx` — skeleton mimicking MatchCard layout with animate-pulse
- `src/components/ErrorState.tsx` — centered error display with red icon circle and retry hint

## Decisions Made

- Kept MatchCard as `<a href>` element (not div+onClick): semantically correct, keyboard navigable, and right-click/open-in-new-tab works natively
- Used `style={{ '--team-color': team.primaryColor } as React.CSSProperties}` + `border-(--team-color)` className: this is the only correct Tailwind v4 approach for runtime dynamic colors; dynamic class interpolation (e.g. `border-[${color}]`) is purged at build time
- `typeof match.homeTeam !== 'string'` for TBD guard: TypeScript narrows the union type correctly and prevents `.id` access on the string `'TBD'`
- `homeWins` is `null` (not `false`) when match is not completed: allows `dimmed={homeWins === false}` to be `false` for non-completed matches without accidental dimming

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — components are ready to compose in Plan 02-03.

## Next Phase Readiness

- All 5 components are importable with correct TypeScript types
- MatchCard accepts `match: Match`, `teamMap: Map<string, Team>`, and `timeZone: string` — matches the data shape from useScheduleData + buildTeamMap
- Plan 02-03 can compose MatchCard, SkeletonCard, and ErrorState directly into the page layout

---
*Phase: 02-schedule-display*
*Completed: 2026-03-01*
