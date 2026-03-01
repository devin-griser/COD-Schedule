# Phase 2: Schedule Display - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see the full CDL schedule — upcoming matches and completed results — in a clean, dark, mobile-first app that converts times to their local timezone. This phase builds the entire display UI against static fixture data (`schedule.json` and `teams.json`). Spoiler mode and VOD links are Phase 3. Live data pipeline is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Match card layout
- Side-by-side arrangement: home team left, away team right, score/time in center (classic esports scoreboard)
- Whole card is tappable — opens stream link on tap, no separate button/link target
- For completed matches: winner's score is bold/bright, loser's side is dimmed
- Full tournament context on every card: stage + round (e.g., "Stage 1 Major · Playoffs")

### Page structure
- Single scrollable page, no tabs or routing
- Upcoming matches section first, Results section below
- Matches grouped by date within each section (date headers)
- Page starts at top — upcoming matches are immediately visible
- Results section ordered most recent first (reverse chronological)

### Visual identity
- Dark gray background (Tailwind gray-950 range, not pure black) — softer, more depth
- Subtle team color accents on match cards (thin borders, logo glow, or tinted text — not overwhelming)
- Clean geometric typography (Inter or system sans-serif) — modern, readable, not sporty/aggressive
- Flat cards with subtle borders — no shadows, minimal and dense

### Time and date display
- Auto-detect browser locale for 12h vs 24h time format (CDL has international fans)
- Friendly date labels for grouping: "Today", "Tomorrow", "Yesterday" for nearby dates, full format ("Saturday, March 15") for others
- Show actual match time only — no relative time indicators ("in 3 hours")
- Timezone shown once at top of page (e.g., "All times in EST") — not repeated per card

### Claude's Discretion
- Loading skeleton design and implementation
- Exact spacing, padding, and gap values
- Error state handling (data load failure)
- Font weight hierarchy within cards
- Section header styling
- Empty state design (if no upcoming/completed matches)
- Mobile breakpoints and responsive scaling strategy

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches. The guiding aesthetic is: clean, dark, single-purpose, no noise.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/index.ts`: Full TypeScript interfaces for Match, Team, ScheduleData, TeamsData — locked schema from Phase 1
- `src/data/schedule.json`: 10 real CDL matches with completed/scheduled statuses, scores, stream URLs, tournament context
- `src/data/teams.json`: All 12 CDL franchises with primaryColor, secondaryColor, logoPath, logoFallback
- `public/teams/`: All 12 team logo PNGs + placeholder.png

### Established Patterns
- Tailwind v4 with `@import "tailwindcss"` — no custom CSS utilities yet
- date-fns + @date-fns/tz already installed for timezone conversion
- @tanstack/react-query installed (available for data loading patterns)
- Vite + React 19 + TypeScript

### Integration Points
- `src/App.tsx`: Currently a bare placeholder — will be replaced with the full schedule UI
- `src/index.css`: Only Tailwind import — global styles can be added here
- Cloudflare Pages deployment pipeline already working (builds and deploys on git push)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-schedule-display*
*Context gathered: 2026-03-01*
