# Project Research Summary

**Project:** COD-Schedule (CDL Schedule Display App)
**Domain:** Mobile-first esports schedule display web app (Call of Duty League)
**Researched:** 2026-02-28
**Confidence:** MEDIUM

## Executive Summary

This is a read-only sports schedule display app targeting CDL fans who want instant access to upcoming match times, scores, and stream links without the friction of the official callofdutyleague.com site. The established approach for this class of app is: static or incrementally-regenerated HTML powered by a decoupled data pipeline, with all timezone logic delegated to the browser. Research confirms the core UI is straightforward — the hard problem is data sourcing, not display. The recommended data source is the PandaScore API (free tier, CoD confirmed, 1,000 req/hour) with a static JSON fallback as an escape hatch if PandaScore's CDL match depth is insufficient at runtime.

The recommended stack is React 19 + Vite 7 + Tailwind CSS v4 + TanStack Query v5, deployed to Cloudflare Pages. This stack is well-matched to the app's requirements: fast cold load, mobile-first responsive styling, declarative data fetching with built-in loading/error states, and zero-config static hosting with commercial use allowed. The architecture follows a clear separation: a flat-file JSON data store, a decoupled data pipeline (PandaScore API or manual JSON), and a presentation layer that does nothing except render what it receives. All external API calls must happen server-side to avoid CORS.

The primary risks are data-sourcing fragility and timezone handling. The CDL official site cannot be scraped reliably (JavaScript SPA, Cloudflare protection) — do not use it as a data source. PandaScore's CDL coverage must be validated in Phase 1 before any UI work depends on it. Timezone storage must be UTC ISO 8601 from day one; retrofitting this later is high-cost. Team metadata must not be hardcoded in components — CDL franchises have rebranded completely between every recent season. These risks are all preventable by sequencing the work correctly: data schema and source validation before UI, static data before automated pipeline.

---

## Key Findings

### Recommended Stack

The core frontend stack has HIGH confidence — all package versions verified against the npm registry on 2026-02-28. React 19 + Vite 7 is the modern standard for a lightweight SPA; there is no benefit to Next.js or SSR for a schedule display app with no SEO requirements. Tailwind CSS v4 (GA since Jan 2025) provides the dark, moody esports aesthetic faster than any alternative. TanStack Query v5 replaces manual `useEffect` fetch boilerplate and provides caching, loading states, and background refetch out of the box. Data sourcing strategy carries MEDIUM confidence — PandaScore's CoD support is confirmed in their API registry, but CDL-specific match depth needs runtime validation.

**Core technologies:**
- React 19.2.4: UI framework — mature ecosystem, React Compiler auto-memoizes without manual optimization
- Vite 7.3.1: Build tool — instant HMR, fastest DX, Node >= 20.19 required
- Tailwind CSS 4.2.1: Styling — CSS-first config (`@import "tailwindcss"`), no config file needed, dark mode via `dark:` variant
- PandaScore API (REST): Data source — free fixtures tier, 1,000 req/hour, no credit card, CoD listed explicitly
- TanStack Query 5.90.21: Data fetching — stale-time control, devtools, retry logic, replaces `useEffect` fetching
- date-fns 4.1.0 + @date-fns/tz: Timezone handling — tree-shakable, IANA timezone support, avoids Moment.js
- Cloudflare Pages: Hosting — unlimited bandwidth free tier, commercial use allowed, git-push deploy

**What NOT to use:** Moment.js (unmaintained, 329 KB), CRA (deprecated), Next.js (SSR overhead with no benefit), Redux/Zustand (over-engineering for a read-only app), Tailwind v3 (use v4), React Router in MVP (unnecessary complexity).

See `/Users/devingriser/Desktop/COD-Schedule/.planning/research/STACK.md` for full details.

### Expected Features

The MVP must beat callofdutyleague.com on three things to justify existence: immediate "next match" visibility, correct local timezone display, and clean mobile layout. Everything else is additive. Research confirms all P1 features are LOW complexity and can be delivered quickly. The differentiating features (hero card, countdown timer, spoiler toggle) are also LOW complexity — the challenge is scope discipline, not implementation.

**Must have (table stakes — P1):**
- Match list with team names, logos, date/time, and stream link — zero utility without this
- Local timezone conversion — users in non-ET timezones cannot use the app otherwise
- "Next match" hero card — the core UX differentiator; callofdutyleague.com buries this in nested tabs
- Match countdown timer — makes the app feel alive; official site lacks this
- Upcoming vs completed distinction with scores — complete schedule experience
- Tournament/stage context label per match — matches feel disconnected without this
- Dark theme — tonally required for an esports product
- Mobile-responsive layout — primary use case is checking schedule on a phone

**Should have (differentiators — P2, add post-launch):**
- Spoiler toggle (hide scores) — localStorage preference, no infrastructure needed
- "Add to calendar" ICS export — replaces push notifications cleanly with zero infrastructure
- VOD links for completed matches — data-pipeline dependent; defer until data source is reliable
- Match format label (Bo5, round) — low effort, adds context

**Defer (v2+):**
- Favorite team filter via localStorage — CDL's 12 teams may never generate enough noise to need filtering
- Season/stage navigation tabs — useful for history browsing, not the core use case
- Historical season archive — out of scope per project definition
- Live match tracking, user accounts, push notifications — anti-features that add infrastructure with no proportional value

See `/Users/devingriser/Desktop/COD-Schedule/.planning/research/FEATURES.md` for full competitor analysis and prioritization matrix.

### Architecture Approach

The correct architecture separates the data pipeline completely from the frontend build. The data store is a flat `schedule.json` committed to the repo. The pipeline writes to that file (via PandaScore API fetch or manual update). The frontend reads from it. If the pipeline fails, the app deploys with the last good data. All times are stored as UTC ISO 8601 strings; the browser converts to local timezone at render time using `Intl.DateTimeFormat`. All external API calls happen in a serverless function, never the browser, to avoid CORS.

**Major components:**
1. Schedule Page — renders match list from data; handles upcoming/completed split; ISR pattern (revalidate: 3600)
2. Match Card — single match display: teams, time, countdown, stream link; receives data as props, no fetching
3. Team Logo/Brand — static image assets in `/public/teams/`, keyed by stable team ID not team name
4. Data Store — `src/data/schedule.json` + `teams.json`; committed to repo; pipeline writes, UI reads
5. Data Pipeline — PandaScore API fetch (or manual update); decoupled from frontend deploy
6. Timezone Utility — UTC-to-local conversion at render time using `Intl.DateTimeFormat` + date-fns/tz

**Build order from architecture research:** Data schema first, then static UI against hardcoded data, then timezone handling, then live data pipeline. Never build the pipeline before knowing what shape the UI needs.

See `/Users/devingriser/Desktop/COD-Schedule/.planning/research/ARCHITECTURE.md` for system diagrams and anti-patterns.

### Critical Pitfalls

1. **Scraping callofdutyleague.com as primary data source** — CDL's site is a JS SPA with Cloudflare protection. Static fetches return a shell with no schedule data. Use PandaScore API (Option A) or Liquipedia API as the data source. Manual JSON is the escape hatch. Never build on the official site.

2. **Storing match times as local time strings** — "3:00 PM ET" stored as a string is wrong for all non-ET users and breaks twice a year at DST transitions. Store ALL times as UTC ISO 8601 (`"2026-03-15T20:00:00Z"`). Convert to local timezone only at display time using IANA timezone identifiers. This decision must be made in the data schema before any data is ingested.

3. **Fetching external data from the browser (CORS)** — Any fetch to an external API (PandaScore, Liquipedia) from browser JavaScript will be blocked by CORS. All external fetching must happen in a serverless function or at build time. The browser only calls your own endpoint.

4. **Hardcoding team data in frontend components** — CDL rebranded every single franchise between 2025 and 2026. Hardcoded team names, logo URLs, or colors will break mid-season. Team metadata must come from the same data pipeline as schedule data, keyed by a stable team ID. Always render graceful fallbacks for unknown teams.

5. **Building the data pipeline before validating the data source** — PandaScore CDL match depth is unverified at runtime. Validate the API returns real 2026 season matches before building UI that depends on it. Keep manual JSON as a parallel path so UI work is never blocked by data pipeline status.

See `/Users/devingriser/Desktop/COD-Schedule/.planning/research/PITFALLS.md` for recovery strategies and the "Looks Done But Isn't" checklist.

---

## Implications for Roadmap

Based on combined research, the dependencies between data schema, data source, and UI components create a clear sequencing requirement. The riskiest decision (data source) must be resolved in Phase 1. The highest-value UI (next match hero card, timezone conversion) should be built against static data in Phase 2 before the pipeline is wired up. Pipeline automation is the last thing to add, not the first.

### Phase 1: Foundation — Data Schema, Source Validation, and Project Setup

**Rationale:** The architecture research's "build order implications" section is unambiguous: data schema comes first because everything downstream depends on it. Data source validation must happen before any UI work begins — if PandaScore has no CDL match depth, the entire data strategy changes. Getting this wrong here requires a full backend rewrite (Pitfall 1).

**Delivers:**
- Vite + React + TypeScript + Tailwind v4 project scaffolded
- `Match` TypeScript interface and `schedule.json` schema defined
- PandaScore API validated: confirmed live 2026 CDL matches returned (or fallback path chosen)
- `teams.json` with all 12 CDL teams (2026 branding), keyed by stable ID, with placeholder fallback
- Static `schedule.json` with 5-10 real matches hardcoded — serves as dev fixture data
- Serverless function scaffold for PandaScore fetch (satisfies CORS architecture requirement)
- All times stored as UTC ISO 8601 in schema (prevents timezone pitfall from day one)
- Cloudflare Pages project configured with git-push deploy

**Features addressed:** Data schema (prerequisite for all features), team metadata (Pitfall 4 prevention)

**Pitfalls avoided:** Pitfall 1 (CDL site scraping), Pitfall 2 (UTC storage decided upfront), Pitfall 3 (serverless function established), Pitfall 4 (team data in pipeline, not components), Pitfall 5 (API validated before UI depends on it)

**Research flag: NEEDS VALIDATION** — PandaScore CDL match depth must be confirmed at runtime. If insufficient, switch to Liquipedia API fallback or manual JSON before proceeding to Phase 2.

---

### Phase 2: Core UI — Schedule Display

**Rationale:** Once the data schema is fixed and static fixture data exists, all UI work can proceed in parallel without any dependency on a live data pipeline. This is the highest-leverage phase — it delivers the app's core value and validates the design before any automation is built.

**Delivers:**
- MatchCard component: team logos, match time (local timezone), stream link, tournament label, status badge
- MatchList component: upcoming matches (ascending) / completed matches (descending), clearly separated
- "Next match" hero card: chronologically first upcoming match, prominent above the fold
- Match countdown timer: "starts in 2h 34m" for matches under 24 hours away
- Scores displayed on completed match cards
- Dark theme with esports typography
- Mobile-responsive layout (375px minimum viewport), tested on real iPhone Safari
- Proper touch targets (44x44px minimum), loading skeleton state, error state
- `100dvh` viewport fix for iOS Safari (not `100vh`)
- TanStack Query wired to local JSON initially

**Features addressed (from FEATURES.md P1 list):**
- Match list with teams, time, stream link
- Local timezone conversion
- "Next match" hero card
- Countdown timer
- Upcoming vs completed distinction
- Scores for completed matches
- Tournament/stage context label
- Team logos
- Dark theme
- Mobile-responsive layout

**Pitfalls avoided:** Timezone display bug (UTC conversion at render time), iOS Safari 100vh bug, touch target failures, no loading/error state

**Research flag: STANDARD PATTERNS** — React component composition, TanStack Query, Tailwind responsive design are all well-documented. No phase research needed.

---

### Phase 3: Live Data Pipeline

**Rationale:** Architecture research is explicit that the pipeline should be built last — after the UI is proven — because the pipeline writes to the same `schedule.json` the UI already reads. Swapping from static to live data requires no frontend changes. Building the pipeline first (before knowing the UI's data needs) is the trap this ordering avoids.

**Delivers:**
- PandaScore API integration: scheduled fetch of CDL matches, normalized to `Match[]` schema
- Server-side caching layer (TanStack Query staleTime or Cloudflare Workers KV) — prevents rate limit abuse
- Automated refresh on a defined cadence (daily minimum, more frequently pre-match)
- `schedule.json` updated automatically without manual deploys
- Liquipedia attribution visible in UI footer (CC-BY-SA 3.0 compliance, if Liquipedia is used)
- Graceful fallback: if pipeline fetch fails, last good `schedule.json` serves without error
- Data freshness indicator: "Last updated X minutes ago" in the UI

**Features addressed:** Data freshness, automated score updates for completed matches

**Pitfalls avoided:** Pitfall 3 (all fetching server-side), performance trap (caching prevents per-user Liquipedia hammering), API key never in frontend JS

**Research flag: NEEDS PHASE RESEARCH** — PandaScore's CDL response schema, rate limit behavior, and exact endpoint patterns need to be confirmed against live API before implementation. Liquipedia API as fallback has additional requirements (User-Agent header, rate limits of 1 req/2s, CC-BY-SA attribution).

---

### Phase 4: Post-Launch Enhancements (v1.x)

**Rationale:** FEATURES.md identifies a clear set of P2 features that add value without changing the app's architecture. These should be added after Phase 3 is stable and real users are using the schedule. They require the data pipeline to be working reliably first (spoiler toggle requires scores, VOD links require post-match data capture).

**Delivers:**
- Spoiler toggle: localStorage preference hides scores with "---" when enabled
- "Add to calendar" ICS export: client-side .ics generation for any match
- VOD links on completed match cards (if data pipeline captures YouTube/Twitch VOD URLs)
- Match format label (Bo5 / Bo3 / round info)

**Features addressed (from FEATURES.md P2 list):** Spoiler toggle, ICS export, VOD links, match format

**Research flag: STANDARD PATTERNS** — localStorage toggle, ICS file generation, and conditional rendering are all well-documented patterns. No phase research needed.

---

### Phase Ordering Rationale

- **Data schema before UI:** Every FEATURES.md feature depends on the `Match` interface shape. Defining it first prevents schema migrations that break working components.
- **Source validation before pipeline automation:** PandaScore CDL coverage is unverified at runtime. STACK.md explicitly flags this as the highest-risk unknown. Validating it in Phase 1 prevents building automation on a data source that doesn't cover the league.
- **Static data before live data:** ARCHITECTURE.md's build order section explicitly recommends this. The UI doesn't care whether data comes from a hardcoded JSON or a live API — building against static data first means UI work is never blocked.
- **Pipeline last:** The data pipeline writes to the same store the UI reads. Separating them means a pipeline failure never breaks the deploy. ARCHITECTURE.md's "Anti-Pattern 4" documents exactly this trap.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1:** PandaScore CDL match depth must be validated with a live API call. If insufficient, fallback to Liquipedia API needs its own mini-research (registration, rate limits, response schema). Decision required before any UI work.
- **Phase 3:** PandaScore response schema normalization, rate limit behavior, and caching strategy need confirmation against live API. Liquipedia fallback has its own requirements (User-Agent, attribution, 1 req/2s rate limit).

Phases with standard patterns (skip research-phase):
- **Phase 2:** React component architecture, TanStack Query, Tailwind responsive CSS, and date-fns timezone conversion are all well-documented with high-confidence sources. No research phase needed.
- **Phase 4:** Spoiler toggle (localStorage), ICS export (standard format), and VOD link display are trivial additions. No research phase needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified against npm registry 2026-02-28. Tailwind v4 GA since Jan 2025. React 19 + Vite 7 current standard. |
| Features | MEDIUM | Competitor feature analysis via direct page inspection (VLR.gg, callofdutyleague.com, Liquipedia CDL). Feature prioritization is opinionated but well-supported by multiple sources. |
| Architecture | MEDIUM | ISR pattern and flat-file data store verified against official Next.js docs and real CDL open-source projects (CDL-Wiki on GitHub). Specific to Vite/Cloudflare Pages deployment vs Next.js/Vercel — patterns translate but require adaptation. |
| Pitfalls | MEDIUM | Timezone pitfalls and CORS behavior are HIGH confidence (MDN official docs). iOS Safari 100vh behavior is HIGH confidence (well-documented). CDL-specific scraping fragility is MEDIUM (multiple community sources). Liquipedia API rate limits and attribution requirements confirmed from official guidelines. |

**Overall confidence: MEDIUM**

### Gaps to Address

- **PandaScore CDL match depth (Phase 1, blocking):** The API lists Call of Duty as a supported game but actual 2026 CDL match coverage is unverified. Must be confirmed with a live API call in Phase 1. If insufficient: evaluate Liquipedia API ($49/month commercial, or free for non-commercial) or fall back to manual JSON. This is the single highest-risk unknown in the entire project.

- **Architecture mismatch (ARCHITECTURE.md uses Next.js, STACK.md recommends Vite):** The architecture research modeled ISR patterns using Next.js App Router. The stack recommendation is Vite + Cloudflare Pages (static hosting, no Node runtime). ISR is not available in a pure static deploy. Resolution: use TanStack Query with a staleTime of 5-60 minutes as the client-side equivalent. The flat-file JSON data store pattern translates directly. If automated refresh without redeploy is needed, Cloudflare Workers can serve the function layer.

- **Vercel Cron in architecture vs Cloudflare Pages in stack:** ARCHITECTURE.md references Vercel Cron for automated pipeline triggering. STACK.md recommends Cloudflare Pages for hosting. If automated pipeline refresh is needed in Phase 3, either use Cloudflare Workers cron triggers (beta) or schedule the fetch externally (GitHub Actions on a cron schedule writing updated JSON to the repo). Resolve during Phase 3 planning.

- **Liquipedia $49/month cost:** STACK.md documents Liquipedia as Option B at $49/month minimum. If PandaScore fails and manual JSON is not acceptable, validate whether Liquipedia grants free access to non-commercial personal projects before committing to that path.

---

## Sources

### Primary (HIGH confidence)
- npm registry (live query 2026-02-28) — React 19.2.4, Vite 7.3.1, Tailwind 4.2.1, TanStack Query 5.90.21, date-fns 4.1.0
- https://vite.dev/guide/ — Vite 7.3.1 stable, Node requirements
- https://react.dev/versions — React 19.2.1 latest
- https://tailwindcss.com/blog/tailwindcss-v4 — v4 GA Jan 2025, CSS-first config
- https://www.pandascore.co/pricing — Free fixtures tier, 1,000 req/hour, no CC required
- https://tanstack.com/query/v5/docs/framework/react/overview — Data fetching patterns
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat — Timezone conversion
- https://allthingssmitty.com/2020/05/11/css-fix-for-100vh-in-mobile-webkit/ — iOS Safari 100dvh fix
- https://liquipedia.net/api and https://liquipedia.net/commons/Liquipedia:API_Usage_Guidelines — Rate limits, attribution, CDL coverage

### Secondary (MEDIUM confidence)
- https://developers.pandascore.co/docs/introduction — CoD listed in call-of-duty.json registry (CDL match depth unverified at runtime)
- callofdutyleague.com/en-us/schedule — direct page inspection (features, UX patterns)
- vlr.gg/matches — direct page inspection (countdown timer, spoiler toggle, dark mode)
- liquipedia.net/callofduty — direct page inspection (Bo3/Bo5 labels, VOD links, stream icons)
- https://nextjs.org/docs/pages/guides/incremental-static-regeneration — ISR pattern (adapts to Vite/CF context)
- https://github.com/Jpreet927/CDL-Wiki — CDL-specific open-source architecture reference
- esports.gg CDL 2026 season guide — season structure, 12 teams, 4 stages, Major format
- liquipedia.net/callofduty/Call_of_Duty_League/Season_7 — CDL 2026 season structure

### Tertiary (LOW confidence)
- WebSearch: CDL scraper GitHub projects — community scraper patterns (may be outdated)
- https://medium.com/geekculture/bypass-scraping-websites-that-has-css-class-names-change-frequently — CSS class instability (single source)

---
*Research completed: 2026-02-28*
*Ready for roadmap: yes*
