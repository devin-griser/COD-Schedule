# Architecture Research

**Domain:** Lightweight sports schedule display web app (no official API)
**Researched:** 2026-02-28
**Confidence:** MEDIUM — Core patterns verified against official Next.js docs and real CDL/esports open-source projects; data pipeline specifics are based on community patterns and verified examples.

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├──────────────────────┬──────────────────────────────────────────┤
│   Schedule Page      │   Match Card Components                   │
│   (ISR, revalidate)  │   Team logos, times, stream links        │
└──────────┬───────────┴───────────────────────┬──────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS LAYER                         │
├──────────────────────┬──────────────────────────────────────────┤
│   /api/schedule      │   /api/revalidate                        │
│   (read from store)  │   (trigger ISR refresh, protected)       │
└──────────┬───────────┴───────────────────────┬──────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA STORE LAYER                          │
├──────────────────────┬──────────────────────────────────────────┤
│   schedule.json      │   teams.json                             │
│   (match records)    │   (team metadata, logos, colors)         │
└──────────────────────┴──────────────────────────────────────────┘
           ▲
           │ writes
┌─────────────────────────────────────────────────────────────────┐
│                        DATA PIPELINE LAYER                       │
├──────────────────────┬──────────────────────────────────────────┤
│   Scraper / Fetcher  │   Vercel Cron Job                        │
│   (Liquipedia API,   │   (triggers scrape on schedule)         │
│    or manual entry)  │                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Schedule Page | Renders match list from data; handles timezone conversion | Next.js page with ISR (`revalidate: 3600`) |
| Match Card | Displays single match: teams, time, stream link | React component, receives match object as prop |
| Team Logo/Brand | Renders team visual identity | Static image assets served from `/public/teams/` |
| `/api/schedule` | Reads and returns current schedule JSON | Next.js API route, reads from flat file or Vercel KV |
| `/api/revalidate` | Triggers ISR page regeneration | Protected endpoint called by cron or manually |
| Data Store | Persists structured schedule data | `schedule.json` checked into repo, or Vercel KV |
| Scraper/Fetcher | Pulls schedule from Liquipedia API or source site | Node.js script or serverless function |
| Cron Job | Triggers scraper on a schedule | Vercel Cron (defined in `vercel.json`) |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Schedule homepage (ISR)
│   ├── layout.tsx              # Root layout, dark theme globals
│   └── api/
│       ├── schedule/
│       │   └── route.ts        # GET: returns schedule data
│       └── revalidate/
│           └── route.ts        # POST: triggers ISR revalidation
├── components/
│   ├── MatchCard.tsx           # Single match display
│   ├── MatchList.tsx           # List of upcoming/completed matches
│   └── TeamLogo.tsx            # Team branding wrapper
├── lib/
│   ├── schedule.ts             # Read/parse schedule data
│   ├── scraper.ts              # Fetch from Liquipedia or CDL site
│   └── timezone.ts             # Local time conversion utilities
├── data/
│   └── schedule.json           # Flat file data store (committed)
│   └── teams.json              # Team metadata (names, colors, logos)
└── public/
    └── teams/                  # Team logo images
```

### Structure Rationale

- **`app/`:** App Router is current Next.js standard (not Pages Router). ISR works natively here via `revalidate` export.
- **`components/`:** UI is purely presentational — components take data as props, no data fetching inside components.
- **`lib/`:** All data logic lives here, separated from UI. Scraper is one file, easily swapped if source changes.
- **`data/`:** Starting with committed JSON files is the right call for MVP. No database setup, no infra. Easy to update manually during early validation. Swap to Vercel KV only if cron automation is needed.
- **`public/teams/`:** Static team assets; logos don't change mid-season, so static files are correct.

## Architectural Patterns

### Pattern 1: ISR (Incremental Static Regeneration) for Schedule Pages

**What:** Pages are statically generated at build time, then regenerated in the background after a set interval when a request arrives. Visitors always get a fast static page; data freshness is bounded by the interval.

**When to use:** Schedule data changes infrequently (a few times per week for CDL). ISR gives static-site speed without a full rebuild on every data update.

**Trade-offs:** Page may show data up to N seconds stale (acceptable for a schedule). Does not work with Next.js static export mode — requires Node.js runtime or Vercel.

**Example:**
```typescript
// app/page.tsx
export const revalidate = 3600 // revalidate at most every hour

export default async function SchedulePage() {
  const matches = await getSchedule() // reads from data/schedule.json or API
  return <MatchList matches={matches} />
}
```

### Pattern 2: Flat File Data Store (Schedule-as-JSON)

**What:** Schedule data lives in a committed `schedule.json` file in the repo. The scraper writes to this file; the app reads from it at build/render time.

**When to use:** MVP phase when data changes are infrequent and the data pipeline is either manual or run locally by the developer before deploying. Zero infrastructure, zero cost, instant setup.

**Trade-offs:** Cannot update data without a deploy (or ISR revalidation). Fine for a schedule app where data changes at most a few times per week. Swap to Vercel KV or a database only when automated cron pipeline is needed and the deploy-on-update pattern becomes painful.

**Example:**
```typescript
// lib/schedule.ts
import scheduleData from '../data/schedule.json'

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string // ISO 8601 UTC
  streamUrl: string
  status: 'upcoming' | 'completed'
  scores?: { home: number; away: number }
}

export function getSchedule(): Match[] {
  return scheduleData.matches
}
```

### Pattern 3: Liquipedia API as Primary Data Source

**What:** Pull structured CDL schedule data from Liquipedia's official REST API (v3, OpenAPI 3). Liquipedia has CDL match data including schedules and results. Their API returns JSON with matches, teams, tournaments.

**When to use:** Whenever automation is worth the setup cost. Liquipedia actively encourages this over scraping their HTML — they provide 1,000 requests/hour on the free tier.

**Trade-offs:** Requires API key/registration. Rate limits exist (1,000 req/hr basic). Data completeness for CDL stream links needs verification — Liquipedia may not always carry stream URLs. Fallback to callofdutyleague.com scraping may be needed for stream links specifically.

**Example:**
```typescript
// lib/scraper.ts
const LIQUIPEDIA_BASE = 'https://api.liquipedia.net/api/v3'

export async function fetchCDLMatches() {
  const response = await fetch(`${LIQUIPEDIA_BASE}/match`, {
    headers: {
      'Authorization': `Bearer ${process.env.LIQUIPEDIA_API_KEY}`,
      'User-Agent': 'CDL-Schedule-App/1.0'
    },
    next: { revalidate: 3600 }
  })
  return response.json()
}
```

## Data Flow

### Schedule Render Flow (User visits the app)

```
User opens app on phone
    ↓
Next.js serves cached static page (ISR)
    ↓
MatchList reads from getSchedule()
    ↓
schedule.json loaded at build/render time
    ↓
MatchCard renders each match with local time (browser-side timezone conversion)
    ↓
User sees upcoming matches in their local time
```

### Data Refresh Flow (Keeping schedule current)

```
Vercel Cron Job fires (e.g., daily at 06:00 UTC)
    ↓
/api/cron/refresh route triggered
    ↓
lib/scraper.ts calls Liquipedia API for CDL matches
    ↓
Response parsed, normalized to Match[] schema
    ↓
schedule.json written (or Vercel KV updated)
    ↓
/api/revalidate called to trigger ISR page regeneration
    ↓
Next request to site gets fresh data
```

### Timezone Conversion Flow (Client-side, not server-side)

```
Match stored as ISO 8601 UTC string in schedule.json
    ↓
Passed as prop to MatchCard
    ↓
Browser JavaScript reads Intl.DateTimeFormat with user's locale
    ↓
Displayed in user's local time (no server involvement)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Committed JSON + ISR is fine. No database. Manual scraper updates are acceptable. |
| 1k-10k users | Add Vercel Cron for automated refresh. Switch data store to Vercel KV to avoid write conflicts. ISR still handles all reads. |
| 10k+ users | CDN edge caching handles it. ISR architecture does not change — Vercel's CDN naturally scales. Only bottleneck would be the scraper hitting Liquipedia rate limits, which is not a user-facing concern. |

### Scaling Priorities

1. **First bottleneck:** Manual data updates become painful when CDL schedule changes frequently. Fix: add Vercel Cron + Liquipedia API automation.
2. **Second bottleneck:** Flat file writes conflict if cron fires while build is running. Fix: move to Vercel KV (key-value store) for atomic writes.

## Anti-Patterns

### Anti-Pattern 1: Fetching Data Client-Side on Page Load

**What people do:** `useEffect(() => { fetch('/api/schedule') }, [])` — data fetches after the page mounts.

**Why it's wrong:** Users see a loading spinner on every visit. Mobile users on slow connections wait before seeing any content. The entire point of this app is instant schedule visibility.

**Do this instead:** Use ISR (`export const revalidate = 3600`) so the page renders with data already embedded. Client-side fetch only for timezone display (which needs the browser's locale — not the server's).

### Anti-Pattern 2: Building a Real-Time Scraper with Puppeteer/Playwright

**What people do:** Run a headless browser to render callofdutyleague.com and extract schedule data dynamically.

**Why it's wrong:** CDL's site is JavaScript-heavy and likely uses Cloudflare anti-bot protection. Headless browsers are expensive to run serverlessly, slow, brittle to site redesigns, and violate ToS. Liquipedia's API gives the same data with none of this complexity.

**Do this instead:** Use Liquipedia's official REST API for CDL match data. Fall back to manual JSON entry for the MVP phase while the API integration is being built.

### Anti-Pattern 3: Storing Timezone-Converted Times in the Data File

**What people do:** Convert match times to a specific timezone (e.g., Eastern) before saving to schedule.json.

**Why it's wrong:** Every user sees matches in a hardcoded timezone. A viewer in Europe or Asia sees wrong times. The app requirement explicitly calls for local timezone conversion.

**Do this instead:** Store all times as UTC ISO 8601 strings. Use the browser's `Intl.DateTimeFormat` API to convert at render time. This is a one-liner in JavaScript and requires zero server involvement.

### Anti-Pattern 4: Coupling the Scraper to the Frontend Deploy

**What people do:** Run the scraper inside `getStaticProps` or during `next build`, fetching live data at build time.

**Why it's wrong:** If the scraper fails (Liquipedia is down, rate limit hit), the build fails. Users see no update. Deploys become unreliable.

**Do this instead:** Separate the scraper from the build. Scraper writes to data store (JSON file or Vercel KV). Build reads from data store. If the scraper fails, the app still deploys with the last good data.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Liquipedia API | REST fetch with API key, polled by cron | 1,000 req/hr free tier. Must include User-Agent header. Requires account registration. |
| callofdutyleague.com | HTML scrape fallback (Cheerio, not Puppeteer) | Only if Liquipedia lacks stream URLs. Likely has Cloudflare — may require careful headers. |
| Vercel Cron | `vercel.json` crons config, triggers API route | Free on Hobby plan with limitations (1 cron job, daily minimum). Verify current limits. |
| Vercel KV (optional) | Read/write via `@vercel/kv` SDK | Only needed if flat-file JSON approach becomes unworkable. Free tier available. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Cron → Scraper | HTTP GET to `/api/cron/refresh` route | Cron job calls an API route; the route runs the scraper logic |
| Scraper → Data Store | Direct file write or KV SDK call | Scraper writes; build reads. Keep these separate — no shared state |
| Page → Data Store | Import at build time (JSON) or fetch in Server Component | ISR handles staleness; no live DB connection needed on each request |
| MatchCard → Browser | Props only; timezone logic runs in browser | `new Date(match.startTime)` in a `useEffect` or client component for locale-aware display |

## Build Order Implications

The component dependencies create a natural build order:

1. **Data schema first** — Define the `Match` interface and `schedule.json` structure before writing any UI or scraper. Everything downstream depends on this shape.

2. **Static data + UI second** — Hardcode a `schedule.json` with 3-5 real matches. Build MatchCard, MatchList, and the homepage against this static data. Validate the design before touching the data pipeline.

3. **Timezone handling third** — Add client-side UTC-to-local conversion once the card renders correctly. This is a small, isolated addition.

4. **Data pipeline last** — Build the Liquipedia scraper and cron job after the UI is proven. The scraper writes to the same `schedule.json` the UI already reads. Swap from manual to automated with no frontend changes required.

This order avoids the trap of building an elaborate scraper before knowing what data shape the UI actually needs.

## Sources

- Next.js ISR official docs (verified 2026-02-27): https://nextjs.org/docs/pages/guides/incremental-static-regeneration
- Liquipedia API official docs: https://liquipedia.net/api — REST API with CDL match data, OpenAPI 3
- Liquipedia API Usage Guidelines: https://liquipedia.net/commons/Liquipedia:API_Usage_Guidelines
- Dota matches API (Liquipedia + Cloudflare Workers pattern, verified architecture): https://github.com/beeequeue/dota-matches-api
- CDL Wiki open-source project (React + Java + Python scraper architecture): https://github.com/Jpreet927/CDL-Wiki
- Sports data scraping pipeline patterns (DEV Community): https://dev.to/ffteamnames/beyond-the-browser-crafting-a-robust-web-scraping-pipeline-for-dynamic-sports-data-3c29
- Vercel Cron Jobs docs: https://vercel.com/docs/cron-jobs/quickstart

---
*Architecture research for: CDL Schedule display web app*
*Researched: 2026-02-28*
