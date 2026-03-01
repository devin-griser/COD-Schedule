# Phase 1: Foundation - Research

**Researched:** 2026-02-28
**Domain:** Vite + React + Tailwind v4 project scaffold, Cloudflare Pages CI/CD, PandaScore API validation, static fixture JSON schema (schedule.json + teams.json)
**Confidence:** HIGH (scaffold/deploy mechanics) / MEDIUM (PandaScore CDL match depth — confirmed endpoint exists but runtime coverage unverified)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Data Source Strategy**
- Try PandaScore API first — sign up for an API key and validate whether it returns 2026 CDL match data
- If PandaScore lacks 2026 CDL data, fall back to manual JSON without regret
- Write a reusable fetch script that can regenerate schedule.json on demand (not a one-time copy-paste)
- The script should work with PandaScore if available, or serve as a template for manual data entry

**Match Schema Shape**
- Include TBD matches with placeholder team values (e.g., team field set to "TBD") — UI should be able to render "TBD vs FaZe"
- Support detailed match statuses: `scheduled`, `live`, `completed`, `postponed`
- Each match has its own stream link field (per-match, not global)
- Tournament context uses structured fields — separate properties for tournament name, stage, and week/round (not a flat string)

**Team Identity & Logos**
- Store both full name ("Atlanta FaZe") and short name ("FaZe") per team in teams.json
- Download team logos and bundle them as local assets in the repo — no external CDN dependency
- Include primary and secondary team colors as hex values per team
- All 12 CDL franchises represented in teams.json

**Fixture Data Scope**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | App has a reliable source of CDL match schedule data (API or manual JSON) | PandaScore CODMW endpoint confirmed (`/codmw/matches/upcoming`), free tier available to all customers; manual JSON fallback fully documented |
| DATA-02 | Match data includes teams, date/time (UTC), scores, stream links, and tournament context | PandaScore response includes `scheduled_at`, `opponents`, `results`, `streams_list`, `league`, `serie`, `tournament` fields; UTC ISO 8601 storage pattern established |
| DATA-03 | Team metadata (names, logos) is dynamic, not hardcoded in components | teams.json pattern established with stable slug-based IDs; all 12 CDL 2026 franchises identified; local asset bundling approach confirmed |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield setup phase with two parallel tracks: (1) scaffold and deploy the project skeleton, and (2) validate the data source and produce static fixture data. The scaffold track is straightforward — Vite 7 + React + TypeScript + Tailwind v4 is a well-documented, zero-ambiguity stack with confirmed tooling. Node v22.22.0 is already installed and satisfies Vite 7's requirement of >= 22.12. Cloudflare Pages deployment is git-push based with a single dashboard configuration step — no wrangler CLI required for basic deploy.

The data track is where the phase's only meaningful uncertainty lives. The PandaScore CODMW endpoint (`GET https://api.pandascore.co/codmw/matches/upcoming`) is confirmed to exist and is available on the free tier. However, whether it returns actual 2026 CDL season matches (as opposed to other Call of Duty competitive events) is unknown without a live API call. The 12 CDL 2026 franchises are fully identified. The match and team JSON schemas are derivable from the CONTEXT.md decisions. Manual JSON entry from Liquipedia is the confirmed fallback and is fully viable — the season is underway with real match data available.

The schema decisions made in this phase are the contract that all Phase 2 UI work builds against. Locked schema choices (UTC ISO 8601 times, structured tournament context, per-match stream links, TBD team support, four match statuses) must be correct before any component is written. Once schedule.json and teams.json exist with 5-10 real matches and all 12 teams, Phase 2 can proceed without any dependency on a live API.

**Primary recommendation:** Scaffold the project first (30 minutes), then call PandaScore live with a real API key. If it returns 2026 CDL matches, write the reusable fetch script to populate schedule.json. If it returns nothing useful, populate schedule.json manually from Liquipedia. Either path delivers the same Phase 1 output — the fetch script just determines whether it calls PandaScore or prompts manual entry.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 7.x (`create-vite@latest`) | Build tool, dev server | Fastest DX in JS ecosystem; `react-ts` template ships zero-config TypeScript + React; Node >= 20.19 or >= 22.12 required (v22.22.0 is installed) |
| React | 19.x (installed by template) | UI framework | Modern standard; React Compiler auto-memoizes; wide ecosystem |
| TypeScript | 5.x (installed by template) | Type safety | Catches API response shape bugs early — critical when consuming third-party API without generated SDK |
| Tailwind CSS | 4.x (`tailwindcss @tailwindcss/vite`) | Utility-first styling | v4 is GA (Jan 2025); CSS-first config (`@import "tailwindcss"`); no `tailwind.config.js` needed; first-party Vite plugin |
| Cloudflare Pages | (service, no npm package) | Static hosting + CI/CD | Unlimited bandwidth free tier; commercial use allowed; 500 builds/month free; git-push deploy; 20,000 file limit on free tier (not a concern for this app) |

### Supporting (Phase 1 only — fetch script)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node built-in `fetch` | (Node 22 built-in) | HTTP calls in fetch script | Use for PandaScore API validation script — no additional dependency needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite `react-ts` template | Manual setup | Template is faster; no reason to hand-configure in Phase 1 |
| Tailwind v4 Vite plugin | PostCSS approach (v3 style) | v4 plugin is simpler; PostCSS config not needed and would be wrong approach for v4 |
| Cloudflare Pages git deploy | `wrangler pages deploy` CLI | CLI is fine for one-off deploys; git integration is better for "deploys on push" success criterion |

**Installation:**
```bash
# Step 1: Scaffold
npm create vite@latest cdl-schedule -- --template react-ts
cd cdl-schedule

# Step 2: Install Tailwind v4
npm install tailwindcss @tailwindcss/vite

# Step 3: Install TanStack Query (needed in Phase 2, install now to not block Phase 2)
npm install @tanstack/react-query date-fns @date-fns/tz
```

---

## Architecture Patterns

### Recommended Project Structure

```
cdl-schedule/
├── public/
│   ├── teams/               # Team logo PNGs keyed by team slug (e.g., optic-texas.png)
│   └── _redirects           # SPA routing for Cloudflare Pages: "/*  /index.html  200"
├── src/
│   ├── data/
│   │   ├── schedule.json    # Static fixture data (5-10 real matches) — Phase 1 output
│   │   └── teams.json       # All 12 CDL franchises — Phase 1 output
│   ├── types/
│   │   └── index.ts         # Match, Team TypeScript interfaces — Phase 1 output
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── fetch-schedule.ts    # Reusable PandaScore fetch script — Phase 1 output
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Pattern 1: Vite + Tailwind v4 Configuration

**What:** Tailwind v4 integrates via its own Vite plugin — no PostCSS config, no `tailwind.config.js`.
**When to use:** This is the only correct approach for Tailwind v4 with Vite.

```typescript
// vite.config.ts
// Source: https://tailwindcss.com/docs/installation/using-vite
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

```css
/* src/index.css — entire Tailwind setup is this one line */
@import "tailwindcss";
```

### Pattern 2: Match TypeScript Interface (locked schema)

**What:** The `Match` interface is the data contract between Phase 1 and Phase 2. Every field in CONTEXT.md decisions maps to a typed property.

```typescript
// src/types/index.ts
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed'

export interface TeamRef {
  id: string        // stable slug, e.g. "optic-texas"
  name: string      // full name, e.g. "OpTic Texas"
  shortName: string // short name, e.g. "OpTic"
}

export interface TournamentContext {
  name: string    // e.g. "CDL 2026 Season 7"
  stage: string   // e.g. "Stage 2 Major Qualifiers"
  round: string   // e.g. "Week 3" or "Quarterfinals"
}

export interface Match {
  id: string
  status: MatchStatus
  scheduledAt: string           // UTC ISO 8601, e.g. "2026-03-15T20:00:00Z"
  homeTeam: TeamRef | 'TBD'
  awayTeam: TeamRef | 'TBD'
  scores?: { home: number; away: number }
  streamUrl: string             // per-match Twitch/YouTube URL
  tournament: TournamentContext
}

export interface Team {
  id: string          // stable slug, e.g. "optic-texas"
  fullName: string    // "OpTic Texas"
  shortName: string   // "OpTic"
  city: string        // "Texas"
  primaryColor: string   // hex, e.g. "#4CAF50"
  secondaryColor: string // hex, e.g. "#000000"
  logoPath: string    // "/teams/optic-texas.png"
  logoFallback: string // "/teams/placeholder.png"
}
```

### Pattern 3: PandaScore Fetch Script Structure

**What:** A reusable Node.js script that calls the PandaScore CODMW endpoint and normalizes the response to the `Match[]` schema, writing to `src/data/schedule.json`.

```typescript
// scripts/fetch-schedule.ts
// Run with: npx tsx scripts/fetch-schedule.ts

const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN
const BASE_URL = 'https://api.pandascore.co'

async function fetchCDLMatches() {
  // Fetch upcoming matches
  const upcoming = await fetch(`${BASE_URL}/codmw/matches/upcoming?per_page=50`, {
    headers: { Authorization: `Bearer ${PANDASCORE_TOKEN}` }
  })
  const upcomingData = await upcoming.json()

  // Fetch recently completed matches
  const past = await fetch(`${BASE_URL}/codmw/matches/past?per_page=50`, {
    headers: { Authorization: `Bearer ${PANDASCORE_TOKEN}` }
  })
  const pastData = await past.json()

  // Normalize and filter for CDL league only (not other CoD competitions)
  const allMatches = [...upcomingData, ...pastData]
    .filter(m => m.league?.name?.includes('Call of Duty League'))
    .map(normalizePandaScoreMatch)

  // Write to src/data/schedule.json
  // ...
}

function normalizePandaScoreMatch(m: any): Match {
  return {
    id: String(m.id),
    status: m.status === 'not_started' ? 'scheduled' : m.status,
    scheduledAt: m.scheduled_at || m.begin_at,
    homeTeam: normalizeTeam(m.opponents?.[0]?.opponent),
    awayTeam: normalizeTeam(m.opponents?.[1]?.opponent),
    scores: m.results?.[0] != null ? {
      home: m.results[0]?.score ?? 0,
      away: m.results[1]?.score ?? 0,
    } : undefined,
    streamUrl: m.streams_list?.[0]?.raw_url ?? 'https://www.twitch.tv/callofdutyleague',
    tournament: {
      name: m.league?.name ?? 'CDL 2026',
      stage: m.serie?.full_name ?? m.tournament?.name ?? '',
      round: m.tournament?.name ?? '',
    }
  }
}
```

### Pattern 4: Cloudflare Pages Deployment

**What:** Git-push deploy via dashboard connection. Single build command configuration.

**Dashboard settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

**SPA routing** (required for client-side routing in Phase 2+):
```
# public/_redirects
/*  /index.html  200
```

Place `_redirects` in the `public/` directory so Vite copies it to `dist/` on build.

### Pattern 5: teams.json Schema

```json
{
  "teams": [
    {
      "id": "optic-texas",
      "fullName": "OpTic Texas",
      "shortName": "OpTic",
      "city": "Texas",
      "primaryColor": "#4CAF50",
      "secondaryColor": "#000000",
      "logoPath": "/teams/optic-texas.png",
      "logoFallback": "/teams/placeholder.png"
    }
  ]
}
```

**Slug convention (Claude's discretion):** Use kebab-case of the full team name, all lowercase. Example: "FaZe Vegas" → `faze-vegas`, "Cloud9 New York" → `cloud9-new-york`, "G2 Minnesota" → `g2-minnesota`. This is stable, human-readable, and matches Liquipedia URL patterns.

### Pattern 6: schedule.json Schema

```json
{
  "version": "1",
  "generatedAt": "2026-02-28T00:00:00Z",
  "matches": [
    {
      "id": "match-001",
      "status": "completed",
      "scheduledAt": "2026-01-10T21:00:00Z",
      "homeTeam": {
        "id": "optic-texas",
        "name": "OpTic Texas",
        "shortName": "OpTic"
      },
      "awayTeam": {
        "id": "boston-breach",
        "name": "Boston Breach",
        "shortName": "Breach"
      },
      "scores": { "home": 3, "away": 1 },
      "streamUrl": "https://www.youtube.com/watch?v=example",
      "tournament": {
        "name": "CDL 2026",
        "stage": "Stage 1 Major Qualifiers",
        "round": "Week 1"
      }
    },
    {
      "id": "match-tbd",
      "status": "scheduled",
      "scheduledAt": "2026-04-15T20:00:00Z",
      "homeTeam": "TBD",
      "awayTeam": {
        "id": "faze-vegas",
        "name": "FaZe Vegas",
        "shortName": "FaZe"
      },
      "streamUrl": "https://www.twitch.tv/callofdutyleague",
      "tournament": {
        "name": "CDL 2026",
        "stage": "Stage 3 Major",
        "round": "Quarterfinals"
      }
    }
  ]
}
```

### Anti-Patterns to Avoid

- **Using Tailwind v3 PostCSS config approach:** v4 uses the Vite plugin, not `postcss.config.js`. Do not create `tailwind.config.js`.
- **Storing times as local strings:** Never write "3:00 PM ET" to schedule.json. Always `"2026-03-15T20:00:00Z"` format.
- **Fetching PandaScore from the browser in Phase 2:** API key must stay server-side. The fetch script runs locally or in a server context only.
- **Using team names as IDs:** Team names change mid-season (every CDL franchise was renamed between 2025 and 2026). Use stable slug IDs everywhere.
- **Embedding logos as base64 in JS bundle:** Serve logos as separate files from `public/teams/`. Vite automatically handles static asset serving.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vite + React + TS project setup | Manual webpack/babel config | `npm create vite@latest -- --template react-ts` | Template is battle-tested; manual setup takes hours and introduces errors |
| Tailwind dark mode utilities | Custom CSS variables for dark theme | Tailwind `dark:` variant + CSS custom properties | v4 handles dark mode natively; hand-rolling duplicates functionality already there |
| HTTP client for fetch script | Custom retry/timeout logic | Node 22 built-in `fetch` | Built-in is sufficient for a one-off script; no need for axios in Phase 1 |
| TypeScript execution for scripts | Compile TS to JS first, then run | `npx tsx scripts/fetch-schedule.ts` | `tsx` runs TypeScript directly without compilation step |

**Key insight:** Phase 1 is infrastructure setup — the tool choices are already decided (CONTEXT.md). The work is execution, not design. Use templates and generators to avoid hand-rolling scaffolding.

---

## Common Pitfalls

### Pitfall 1: PandaScore Returns Non-CDL CoD Events
**What goes wrong:** The `/codmw/matches/upcoming` endpoint returns ALL Call of Duty: Modern Warfare competitive matches, not just CDL. This includes Call of Duty Challengers (the tier-2 circuit), regional qualifiers, and other tournaments. Blindly using all results pollutes schedule.json with non-CDL content.
**Why it happens:** PandaScore organizes data by game title, not specific league. CDL and Challengers are the same game.
**How to avoid:** Filter by `league.name` or `league.id` in the normalization step. The CDL league name in PandaScore should contain "Call of Duty League" — verify the exact value with the first live API response. Add a `console.log(allMatches[0]?.league)` to inspect before building the filter.
**Warning signs:** schedule.json contains 50+ matches or includes unfamiliar team names not in the 12-franchise list.

### Pitfall 2: Tailwind v4 Classes Not Working After Scaffold
**What goes wrong:** After scaffolding with `npm create vite@latest -- --template react-ts`, Tailwind classes appear in markup but have no effect. The default template CSS conflicts with v4.
**Why it happens:** The Vite template installs its own `index.css` with default styles. Adding `@import "tailwindcss"` without removing conflicting styles causes issues. Also, the template ships no Tailwind — you must install it as a separate step.
**How to avoid:**
1. After scaffold, install `tailwindcss @tailwindcss/vite`
2. Update `vite.config.ts` to add the `tailwindcss()` plugin
3. Replace all content in `src/index.css` with `@import "tailwindcss";` — remove the template's default styles
4. Remove the default App.css if the template created one, or clear its contents
**Warning signs:** Classes like `text-red-500` render with no color change; no visual effect from any Tailwind utility class.

### Pitfall 3: Cloudflare Pages Treats Build Failures as Deploy Success
**What goes wrong:** If `npm run build` exits with an error, Cloudflare Pages marks the build as failed but may still serve the previous deployment silently. The dashboard shows a failed build, but the site appears to work — masking the real state.
**Why it happens:** Cloudflare Pages preserves the last successful deploy as the live site.
**How to avoid:** Always check the Cloudflare Pages build log after the first deploy. Confirm the deployed version matches the expected commit. Fix any TypeScript errors before the first push — `npm run build` locally first.
**Warning signs:** Site looks fine but build dashboard shows red; pushing changes doesn't update the live site.

### Pitfall 4: PandaScore API Key Committed to Repo
**What goes wrong:** The fetch script requires a `PANDASCORE_TOKEN`. If this is hardcoded in the script or committed in a `.env` file, the key is exposed in git history.
**Why it happens:** Fast prototyping, forgetting `.gitignore`.
**How to avoid:** Create `.env.local` (not `.env`) for the key. Add `.env*` to `.gitignore` before any git add. The fetch script reads `process.env.PANDASCORE_TOKEN` — never hardcode.
**Warning signs:** `.env` file appears in `git status`; token string appears in `git diff`.

### Pitfall 5: Logo Files Too Large for Cloudflare Pages Free Tier
**What goes wrong:** Cloudflare Pages free tier has a 25 MiB per-file limit and 20,000 file limit. Team logos downloaded at full resolution from official sources can exceed this per-file or total repo size.
**Why it happens:** Official team logos are sometimes provided as high-res PNGs or SVGs with large file sizes.
**How to avoid:** Download logos from Liquipedia (community-sized images, typically 50-200KB per logo). If a downloaded logo exceeds 500KB, resize or optimize it before committing. Target total `public/teams/` directory size under 5MB.
**Warning signs:** `git push` hangs on large files; Cloudflare build fails with file size errors.

---

## Code Examples

Verified patterns from official sources:

### Full Vite Config with Tailwind v4
```typescript
// vite.config.ts
// Source: https://tailwindcss.com/docs/installation/using-vite (official docs)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### PandaScore Authentication Header
```typescript
// Source: https://developers.pandascore.co/docs/make-your-first-request
const response = await fetch('https://api.pandascore.co/codmw/matches/upcoming', {
  headers: {
    Authorization: `Bearer ${process.env.PANDASCORE_TOKEN}`
  }
})
const data = await response.json()
// data is an array of match objects with: id, name, status, scheduled_at,
// opponents (array), results (array), streams_list (array), league, serie, tournament
```

### Confirmed PandaScore CODMW Endpoints
```
GET https://api.pandascore.co/codmw/matches/upcoming
GET https://api.pandascore.co/codmw/matches/past
GET https://api.pandascore.co/codmw/matches/running
```
All three are available to free tier ("available to all customers").

### PandaScore Response Key Fields (from API reference)
```typescript
// Relevant fields from a PandaScore match object:
interface PandaScoreMatch {
  id: number
  name: string
  status: 'not_started' | 'running' | 'finished'
  scheduled_at: string   // UTC ISO 8601
  begin_at: string | null
  end_at: string | null
  match_type: string     // e.g. 'best_of'
  number_of_games: number
  opponents: Array<{ opponent: { id: number; name: string; image_url: string } }>
  results: Array<{ team_id: number; score: number }>
  streams_list: Array<{ raw_url: string; language: string }>
  league: { id: number; name: string }
  serie: { id: number; full_name: string }
  tournament: { id: number; name: string }
  videogame: { name: string }
}
```

### Cloudflare Pages Build Settings
```
Build command: npm run build
Build output directory: dist
Node.js version: 22.x (set in Environment Variables as NODE_VERSION=22)
```

### SPA Routing File
```
# public/_redirects
# Source: https://developers.cloudflare.com/pages/configuration/redirects/
/*  /index.html  200
```

### Running the Fetch Script
```bash
# Install tsx for TypeScript script execution (dev dependency)
npm install -D tsx

# Run the fetch script (requires PANDASCORE_TOKEN in .env.local)
npx tsx scripts/fetch-schedule.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 + `tailwind.config.js` + PostCSS | Tailwind v4 + `@tailwindcss/vite` plugin, `@import "tailwindcss"` | Jan 2025 (v4 GA) | No config file needed; CSS-first setup; faster builds |
| `create-react-app` scaffold | `npm create vite@latest -- --template react-ts` | 2023 (CRA deprecated) | CRA is unmaintained; Vite is the current standard |
| Moment.js for date handling | `date-fns` + `@date-fns/tz` | 2020+ | Moment.js unmaintained; date-fns is tree-shakable and maintained |
| Express server for API proxy | Cloudflare Workers / serverless functions | 2021+ | No server to maintain; scales to zero; free tier adequate |

**Deprecated/outdated:**
- `create-react-app`: Dead — React team removed it from recommended tooling in 2023. Never use.
- `tailwind.config.js`: Not needed for v4. Creating one causes confusion but doesn't break things in v4.
- Moment.js: Unmaintained since 2020, ~329KB gzipped. Never use for new projects.

---

## Open Questions

1. **Does PandaScore's `/codmw/matches/upcoming` return 2026 CDL season matches specifically?**
   - What we know: The endpoint exists and is free. The `codmw` prefix refers to Call of Duty: Modern Warfare (the game engine CDL uses). PandaScore lists CoD as a supported game.
   - What's unclear: Whether CDL Season 7 (2026) matches are actually in their database vs. only Challengers/regional events. The CODMW endpoint returns all CoD competitions — league filtering is required but the exact `league.id` value for CDL is unknown until a live call is made.
   - Recommendation: Make the API call first thing in Phase 1. If it returns 0 CDL-league matches after filtering, immediately switch to manual JSON entry from Liquipedia and document the fallback decision.

2. **What are the exact hex colors for all 12 CDL 2026 teams?**
   - What we know: OpTic Texas uses green (#4CAF50) and black (#000000). LA Thieves uses red (#ef3232) and black (#000000). Boston Breach has green/red branding. Other teams need verification.
   - What's unclear: Exact hex values for G2 Minnesota, FaZe Vegas, Cloud9 New York, Paris Gentle Mates, Riyadh Falcons, Carolina Royal Ravens, Miami Heretics, Vancouver Surge, Toronto KOI.
   - Recommendation: Source from Liquipedia team pages (each CDL franchise has a Liquipedia entry with hex colors in the infobox). If not available, use brandcolors.net or the parent org's brand guidelines. Placeholder is acceptable in Phase 1 fixture data.

3. **Which CDL 2026 matches should be in the fixture data for maximum Phase 2 testing value?**
   - What we know: The season started December 5, 2025. Stage 1 Major has occurred. Stage 2 is underway as of Feb 2026. Real scores exist for completed Stage 1 and Stage 2 qualifier matches.
   - What's unclear: Which specific match IDs give the best mix for Phase 2 (completed with scores, upcoming, postponed, TBD opponent).
   - Recommendation (Claude's discretion): Include 3 completed Stage 1 matches with real scores, 3 upcoming Stage 2/3 qualifier matches, 1 postponed match, 1 match with TBD opponent. Source from Liquipedia's CDL Season 7 page for real data.

---

## CDL 2026 Team Reference

All 12 franchises confirmed for Phase 1 teams.json. Slugs are Claude's discretion (kebab-case):

| Full Name | Short Name | Slug | City |
|-----------|-----------|------|------|
| Boston Breach | Breach | `boston-breach` | Boston, USA |
| Carolina Royal Ravens | Ravens | `carolina-royal-ravens` | Carolina, USA |
| Cloud9 New York | C9 NY | `cloud9-new-york` | New York, USA |
| FaZe Vegas | FaZe | `faze-vegas` | Las Vegas, USA |
| G2 Minnesota | G2 | `g2-minnesota` | Minnesota, USA |
| Los Angeles Thieves | Thieves | `los-angeles-thieves` | Los Angeles, USA |
| Miami Heretics | Heretics | `miami-heretics` | Miami, USA |
| OpTic Texas | OpTic | `optic-texas` | Texas, USA |
| Paris Gentle Mates | GentleMates | `paris-gentle-mates` | Paris, France |
| Riyadh Falcons | Falcons | `riyadh-falcons` | Riyadh, Saudi Arabia |
| Toronto KOI | KOI | `toronto-koi` | Toronto, Canada |
| Vancouver Surge | Surge | `vancouver-surge` | Vancouver, Canada |

**Logo sourcing recommendation:** Liquipedia team pages (e.g., `liquipedia.net/callofduty/OpTic_Texas`) contain up-to-date team logos in PNG format. Download each, save as `public/teams/{slug}.png`. Create a `public/teams/placeholder.png` as the fallback for unknown teams.

---

## Sources

### Primary (HIGH confidence)
- `https://tailwindcss.com/docs/installation/using-vite` — Official Tailwind v4 Vite setup, verified steps (fetched 2026-02-28)
- `https://developers.pandascore.co/reference/get_codmw_matches_upcoming` — CODMW upcoming matches endpoint, fields confirmed: `scheduled_at`, `opponents`, `results`, `streams_list`, `league`, `tournament` (fetched 2026-02-28)
- `https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/` — Build command `npm run build`, output dir `dist`, SPA routing via `_redirects` (fetched 2026-02-28)
- `https://developers.cloudflare.com/pages/platform/limits/` — 500 builds/month free, 25 MiB file limit, 20,000 file limit, no bandwidth limit (fetched 2026-02-28)
- `https://vite.dev/guide/` — Node >= 20.19 or >= 22.12 requirement; `react-ts` template; Node v22.22.0 confirmed installed
- `.planning/research/STACK.md` — Package versions verified against npm registry 2026-02-28 (React 19.2.4, Vite 7.3.1, Tailwind 4.2.1, TanStack Query 5.90.21, date-fns 4.1.0)

### Secondary (MEDIUM confidence)
- `https://cod-esports.fandom.com/wiki/Call_of_Duty_League/2026_Season` — 12 CDL 2026 franchises confirmed (fetched 2026-02-28)
- `https://liquipedia.net/callofduty/Call_of_Duty_League/Season_7` — Season format (4 stages, Dec 2025 – Jul 2026), all 12 teams confirmed (fetched 2026-02-28)
- `https://developers.pandascore.co/docs/make-your-first-request` — Bearer token auth, base URL `https://api.pandascore.co` (fetched 2026-02-28)
- `https://developers.cloudflare.com/pages/configuration/redirects/` — `_redirects` file syntax for SPA routing (fetched 2026-02-28)
- `https://liquipedia.net/api` — Liquipedia pricing: $49/month commercial, free for non-commercial open-source (fetched 2026-02-28)

### Tertiary (LOW confidence)
- WebSearch: CDL 2026 team brand colors — OpTic Texas green/black confirmed; other teams need direct verification from Liquipedia or brand guidelines pages
- Community discussion: PandaScore filtering by league for CDL vs Challengers — pattern inferred from API structure, not verified with live call

---

## Metadata

**Confidence breakdown:**
- Scaffold mechanics: HIGH — Vite template, Tailwind v4 Vite plugin, Cloudflare Pages deploy settings all verified from official docs
- PandaScore endpoint existence: HIGH — endpoint URL and response fields confirmed from API reference
- PandaScore CDL match depth: LOW — endpoint exists but whether 2026 CDL season matches populate it is unverified without a live API call
- Teams.json data: HIGH — all 12 franchises confirmed from Liquipedia + CoD Esports Wiki; slugs are deterministic from names
- Match schema design: HIGH — all field decisions come directly from CONTEXT.md locked decisions; no ambiguity
- Team colors: LOW — only 2-3 teams have verified hex values; remaining 9 need direct research per-team

**Research date:** 2026-02-28
**Valid until:** 2026-04-01 (stable for scaffold/deploy mechanics; PandaScore endpoint valid until API changes; CDL team list valid for 2026 season)
