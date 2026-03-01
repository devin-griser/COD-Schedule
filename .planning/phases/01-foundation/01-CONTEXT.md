# Phase 1: Foundation - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate the CDL data source (PandaScore API or manual fallback), lock the match and team data schemas, scaffold a Vite + React + Tailwind v4 project with Cloudflare Pages deployment, and produce static fixture data (schedule.json + teams.json) that all Phase 2 UI work builds against.

</domain>

<decisions>
## Implementation Decisions

### Data Source Strategy
- Try PandaScore API first — sign up for an API key and validate whether it returns 2026 CDL match data
- If PandaScore lacks 2026 CDL data, fall back to manual JSON without regret
- Write a reusable fetch script that can regenerate schedule.json on demand (not a one-time copy-paste)
- The script should work with PandaScore if available, or serve as a template for manual data entry

### Match Schema Shape
- Include TBD matches with placeholder team values (e.g., team field set to "TBD") — UI should be able to render "TBD vs FaZe"
- Support detailed match statuses: `scheduled`, `live`, `completed`, `postponed`
- Each match has its own stream link field (per-match, not global)
- Tournament context uses structured fields — separate properties for tournament name, stage, and week/round (not a flat string)

### Team Identity & Logos
- Store both full name ("Atlanta FaZe") and short name ("FaZe") per team in teams.json
- Download team logos and bundle them as local assets in the repo — no external CDN dependency
- Include primary and secondary team colors as hex values per team
- All 12 CDL franchises represented in teams.json

### Fixture Data Scope
- Include a mix of completed matches (with scores) and upcoming matches — enables Phase 2 to build and test both UI sections
- Use real 2026 CDL match data (actual teams, real dates/scores)
- Include 1-2 edge case matches: at least one postponed match and/or one with a TBD opponent
- 5-10 matches total as specified in success criteria

### Claude's Discretion
- Team ID format (slug-based, abbreviation, or other practical format)
- Manual fallback data source (CDL website, Liquipedia, or best available)
- Which specific tournament/stage the fixture matches come from (prioritize variety for UI testing)
- Fetch script implementation details
- Project scaffold configuration choices (Vite/React/Tailwind defaults)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase (Vite + React + Tailwind v4)

### Integration Points
- Cloudflare Pages deployment on git push (CI/CD pipeline)
- schedule.json and teams.json serve as the data contract between Phase 1 and Phase 2

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-28*
