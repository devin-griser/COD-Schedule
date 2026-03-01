# Roadmap: CDL Schedule

## Overview

Three phases take this project from nothing to a publicly-deployed CDL schedule app. Phase 1 locks in the data foundation — the single biggest risk in the project is data sourcing, so that gets resolved first, before any UI work depends on it. Phase 2 builds the entire display app against static fixture data, delivering the full user-facing product. Phase 3 adds the two enhancement features and wires up the live data pipeline to replace the static fixture with real match data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Data schema, source validation, project scaffold, and static fixture data (completed 2026-03-01)
- [ ] **Phase 2: Schedule Display** - Full UI built against fixture data, deployed publicly
- [ ] **Phase 3: Live Pipeline + Enhancements** - Automated data refresh and display enhancements

## Phase Details

### Phase 1: Foundation
**Goal**: The project exists with a validated data source, locked schema, and static fixture data that all Phase 2 UI work can build against
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Vite + React + Tailwind v4 project runs locally and deploys to Cloudflare Pages on git push
  2. PandaScore API has been called live and either confirmed to return 2026 CDL matches, or a fallback path (Liquipedia/manual JSON) has been chosen and documented
  3. `schedule.json` contains 5-10 real hardcoded matches with the finalized schema (UTC ISO 8601 times, both teams, stream links, scores, tournament context)
  4. `teams.json` contains all 12 CDL franchises keyed by stable ID with logo paths and placeholder fallbacks
**Plans**: 3 plans
  - [x] 01-01-PLAN.md — Project scaffold + schema contracts + Cloudflare Pages deploy (complete — live at https://cod-schedule.devingriser.workers.dev/)
  - [x] 01-02-PLAN.md — PandaScore API validation + fetch script + data source decision (complete — 87 CDL matches confirmed, schedule.json populated)
  - [x] 01-03-PLAN.md — Populate teams.json + schedule.json + team logos (complete — 12 teams, 10 curated matches with TBD edge case)

### Phase 2: Schedule Display
**Goal**: Users can see the full CDL schedule — upcoming matches and completed results — in a clean, dark, mobile-first app that converts times to their local timezone
**Depends on**: Phase 1
**Requirements**: SCHED-01, SCHED-02, SCHED-03, SCHED-04, SCHED-05, SCHED-06, SCHED-07, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. User on a phone (375px viewport) can see upcoming matches listed in chronological order, each showing both team logos and names, the match time in their local timezone, and a clickable stream link
  2. User can see completed matches with final scores, visually separated from the upcoming section
  3. Each match card shows the tournament/stage context (e.g., "Major II Qualifiers — Week 3")
  4. The app uses a dark theme with sharp typography and no distracting UI chrome — no ads, nav clutter, or marketing
  5. The layout works at 375px minimum and scales cleanly to desktop
**Plans**: 3 plans
  - [x] 02-01-PLAN.md — Infrastructure + data layer (dark theme, Inter font, React Query, utility functions, hooks) (complete — utilities, hooks, global styles all done)
  - [ ] 02-02-PLAN.md — Component library (TeamLogo, TeamSlot, MatchCard, SkeletonCard, ErrorState)
  - [ ] 02-03-PLAN.md — Page assembly + visual verification (SchedulePage, MatchSection, DateGroup, App.tsx wiring)

### Phase 3: Live Pipeline + Enhancements
**Goal**: The schedule updates automatically from a live data source, and users can hide spoilers and access VOD replays
**Depends on**: Phase 2
**Requirements**: XTRA-01, XTRA-02
**Success Criteria** (what must be TRUE):
  1. User can toggle spoiler mode to hide all match scores — the preference persists when they reload the page
  2. Completed match cards show a VOD link to watch the replay (when data pipeline captures it)
  3. Schedule data refreshes automatically from the live API without a manual deploy — if the pipeline fetch fails, the last good data still serves
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete    | 2026-03-01 |
| 2. Schedule Display | 1/3 | In progress | - |
| 3. Live Pipeline + Enhancements | 0/TBD | Not started | - |
