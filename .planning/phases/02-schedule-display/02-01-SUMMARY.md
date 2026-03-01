---
phase: 02-schedule-display
plan: 01
subsystem: ui
tags: [react, react-query, tailwind, date-fns, typescript, dark-theme, inter-font]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: TypeScript types (Match, Team, ScheduleData, TeamsData), schedule.json, teams.json, Vite+React+Tailwind scaffold

provides:
  - src/utils/dateHelpers.ts — formatMatchTime (Intl locale 12h/24h), formatDateLabel (Today/Tomorrow/Yesterday), getDateKey (TZDate timezone-aware)
  - src/utils/scheduleHelpers.ts — partitionMatches (upcoming asc / completed desc), groupByDate (Map insertion-order), buildTeamMap (O(1) id lookup)
  - src/hooks/useTimezone.ts — useTimezone returning timeZone + short displayName, memoized
  - src/hooks/useScheduleData.ts — useScheduleData wrapping React Query, dynamic JSON imports, staleTime Infinity
  - index.html — class="dark" on html, Inter font from Google Fonts, title "CDL Schedule", theme-color #030712
  - src/index.css — @custom-variant dark always-on, Inter @theme font, dark body base styles
  - src/main.tsx — QueryClientProvider wrapping App

affects: [02-02, 02-03]

# Tech tracking
tech-stack:
  added: [Inter font via Google Fonts CDN]
  patterns:
    - Tailwind v4 always-dark via @custom-variant and class="dark" on html (no prefers-color-scheme)
    - CSS custom property @theme for Inter font registration
    - React Query with dynamic import() for static JSON data with staleTime Infinity
    - TZDate for all timezone-aware date operations (never string slice UTC)
    - Intl.DateTimeFormat for locale-aware 12h/24h time formatting (not date-fns format)
    - useMemo wrapping timezone detection to compute once per mount

key-files:
  created:
    - src/utils/dateHelpers.ts
    - src/utils/scheduleHelpers.ts
    - src/hooks/useTimezone.ts
    - src/hooks/useScheduleData.ts
  modified:
    - index.html
    - src/index.css
    - src/main.tsx

key-decisions:
  - "Intl.DateTimeFormat for time formatting instead of date-fns format — respects locale 12h/24h preference for EU fans"
  - "TZDate from @date-fns/tz for all timezone conversions — avoids UTC string slice pitfall for midnight-crossing matches"
  - "staleTime: Infinity for React Query — schedule.json is static, no re-fetch needed"
  - "useMemo for useTimezone values — both timeZone and displayName computed once per mount"
  - "Inter font via Google Fonts CDN link — zero bundle cost, Cloudflare Pages has no CDN restrictions"

patterns-established:
  - "Pattern: Always-dark Tailwind via @custom-variant dark — write base dark classes without dark: prefix"
  - "Pattern: Dynamic JSON import with type cast — import('../data/schedule.json') then .default as ScheduleData"
  - "Pattern: Date grouping via Map<string, ...> — preserves insertion order for chronological groups"

requirements-completed: [SCHED-01, SCHED-02, SCHED-03, SCHED-05, DSGN-01]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 2 Plan 01: Schedule Display Infrastructure Summary

**Data utilities (partitionMatches, groupByDate, buildTeamMap, TZDate formatting) and global app infrastructure (dark theme, Inter font, React Query provider) ready for Phase 2 component plans**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T13:52:00Z
- **Completed:** 2026-03-01T13:54:03Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- 4 utility/hook files created with correct exports and zero TypeScript errors
- Global dark theme via Tailwind v4 @custom-variant always-on pattern
- Inter font loaded from Google Fonts CDN via preconnect + link in index.html
- React Query QueryClientProvider active at the app root

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data utility functions and hooks** - `ec312f2` (feat)
2. **Task 2: Configure global infrastructure — dark theme, Inter font, React Query provider** - `1e9f100` (feat)

## Files Created/Modified
- `src/utils/dateHelpers.ts` - formatMatchTime (Intl locale-aware), formatDateLabel (friendly labels), getDateKey (TZDate timezone key)
- `src/utils/scheduleHelpers.ts` - partitionMatches (upcoming/completed), groupByDate (Map, insertion order), buildTeamMap (O(1) id lookup)
- `src/hooks/useTimezone.ts` - useTimezone returning IANA timeZone + short displayName, both memoized
- `src/hooks/useScheduleData.ts` - useScheduleData with React Query, dynamic JSON imports, staleTime: Infinity
- `index.html` - class="dark" on html element, Inter font preconnect/link, title "CDL Schedule", theme-color #030712
- `src/index.css` - @custom-variant dark override, Inter @theme font, dark body base styles
- `src/main.tsx` - QueryClientProvider wrapping App

## Decisions Made
- Used `Intl.DateTimeFormat` for `formatMatchTime` — date-fns `format` with hardcoded patterns ignores locale 12h/24h preference
- Used `TZDate` from `@date-fns/tz` for all timezone operations — naive string slicing ignores DST and midnight-crossing matches
- Set `staleTime: Infinity` for React Query — schedule.json is static, re-fetching is never correct
- Wrapped useTimezone values in `useMemo` — computed once per component mount, stable references
- Inter font via Google Fonts CDN link — zero bundle cost, Cloudflare Pages imposes no CDN restrictions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ran `npm install` to install missing @cloudflare/vite-plugin**
- **Found during:** Task 2 (npm run build verification)
- **Issue:** `@cloudflare/vite-plugin` was in devDependencies but node_modules/@cloudflare/ did not exist, causing `tsc -b && vite build` to fail with TS2307
- **Fix:** Ran `npm install` to install all declared devDependencies
- **Files modified:** None (node_modules only — package.json unchanged)
- **Verification:** `npm run build` succeeded after install
- **Committed in:** 1e9f100 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing node_modules)
**Impact on plan:** Required for build verification. No scope creep.

## Issues Encountered
- `@cloudflare/vite-plugin` was not installed (node_modules missing from a prior clean state). Resolved via `npm install` before build verification.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All data utilities and hooks are importable and typed correctly
- QueryClientProvider is active — components can call useScheduleData without "No QueryClient set" error
- Dark gray-950 background and Inter font are applied globally
- Plans 02-02 and 02-03 can focus purely on component rendering

---
*Phase: 02-schedule-display*
*Completed: 2026-03-01*
