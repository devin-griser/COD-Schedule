# Stack Research

**Domain:** Mobile-first esports schedule display web app (CDL / Call of Duty League)
**Researched:** 2026-02-28
**Confidence:** MEDIUM — Core frontend stack is HIGH confidence (verified via npm). Data sourcing strategy is MEDIUM confidence (PandaScore CoD support confirmed via official docs; actual CDL data coverage needs runtime validation).

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Mature ecosystem, strong mobile-first component patterns, React Compiler (v1.0) auto-memoizes without manual optimization — ideal for a beginner with Odin Project background stepping up to a real project |
| Vite | 7.3.1 | Build tool and dev server | Fastest dev startup in the JS ecosystem, instant HMR, React template ships zero config. Far superior DX to CRA (dead) or webpack (complex). Node >= 20.19 required |
| Tailwind CSS | 4.2.1 | Utility-first styling | v4 is a complete rewrite — zero config, CSS-first (`@import "tailwindcss"`), 182x faster incremental builds. Dark mode via `dark:` variant and CSS variables. Ideal for the moody esports aesthetic with full control over spacing and color without leaving HTML |
| PandaScore API | (REST) | CDL schedule data source | **Free fixtures tier** covers Call of Duty League with 1,000 req/hour, no credit card required. Confirmed: "call-of-duty.json" in API registry. Provides match schedules, results, team data. This is the least-risk data path for a greenfield project without scraping infrastructure |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Query | 5.90.21 | Data fetching, caching, loading/error states | Use immediately — handles stale data, background refetch, and loading/error UI out of the box. Eliminates manual `useEffect` fetch boilerplate. Critical for a schedule app where data freshness matters |
| date-fns + @date-fns/tz | 4.1.0 | Timezone-aware date formatting | CDL matches are broadcast in ET; users are global. date-fns is tree-shakable (import only what you need), `@date-fns/tz` adds IANA timezone support. Use for all date display and local timezone conversion |
| React Router | 7.x | Client-side routing (optional) | Only needed if the app grows to multi-page (team pages, results history). For MVP with a single schedule view, skip it — it's unnecessary complexity |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Cloudflare Pages | Static hosting | Unlimited bandwidth free tier, no credit card, commercial use allowed. Superior to Vercel Hobby (100 GB cap, non-commercial only). Git-push deploy. Zero config for Vite builds |
| TypeScript | Type safety | Use `react-ts` Vite template. Catches API response shape bugs early — critical when consuming a third-party API without a generated SDK |
| ESLint + `@eslint/js` | Linting | Ships with Vite's React template; keep defaults |

---

## Data Sourcing Strategy (Critical Decision)

The biggest unknown for this project is reliable CDL schedule data. There are three viable approaches ranked by risk:

### Option A: PandaScore API (Recommended — Low Risk)

**Confidence: MEDIUM** (CoD listed as supported game; actual CDL match depth unverified at runtime)

PandaScore provides:
- Free "Fixtures Only" plan: 1,000 req/hour, no credit card
- Call of Duty listed explicitly among 13 supported titles
- Endpoints: match schedules, results, team metadata, tournament brackets
- REST API with OpenAPI 3 docs

**Risk:** CDL-specific match coverage may be incomplete or lag behind the official site. Validate during Phase 1 by hitting the API and checking if the 2026 season matches are populated before committing to this path.

**Endpoint pattern to test:**
```
GET https://api.pandascore.co/call-of-duty/matches/upcoming
Authorization: Bearer {token}
```

### Option B: Liquipedia Data (Fallback — Moderate Risk)

**Confidence: LOW** (pricing confirmed at $49/month minimum; no free CDL-specific tier)

Liquipedia API covers CDL and is community-maintained (most complete CDL data outside the official site). However, cheapest plan is $49/month. Only viable if they grant the non-commercial/educational free tier. Contact required before committing to this path.

### Option C: Manual Data Entry (Escape Hatch — Zero Risk)

**Confidence: HIGH**

If both APIs fail or lack CDL coverage, maintain schedule data as a static JSON file (`/src/data/schedule.json`) updated manually each week. CDL runs ~12 weeks of regular season with ~6-10 matches per week — manageable manually for an MVP. This unblocks all UI work regardless of API status.

**Do not attempt scraping callofdutyleague.com** — the site is React-rendered (JS-heavy), requires browser execution, and any scraper would break on any site update. The maintenance cost far exceeds manual entry.

---

## Installation

```bash
# Scaffold with Vite (React + TypeScript)
npm create vite@latest cdl-schedule -- --template react-ts

cd cdl-schedule

# Core supporting libraries
npm install @tanstack/react-query date-fns @date-fns/tz

# Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D typescript @types/react @types/react-dom
```

**Tailwind v4 Vite config** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Tailwind v4 CSS entry** (`src/index.css`):
```css
@import "tailwindcss";
```

No `tailwind.config.js` needed in v4.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React 19 | Svelte 5 | If bundle size is critical constraint and team has Svelte experience; Svelte compiles to vanilla JS with no runtime. Not recommended here because React's ecosystem (TanStack Query, community) is better suited for a beginner extending the project |
| React 19 | Vue 3 | If coming from Vue background. Comparable DX, weaker data-fetching ecosystem for this use case |
| Vite 7 | Next.js 15 | Only if SSR/SEO is required. Schedule data is not indexed by search engines meaningfully; no need for server-side rendering. Next.js adds complexity with no benefit for this app |
| Tailwind CSS v4 | CSS Modules | If avoiding utility-class markup. Tailwind v4's dark mode and responsive utilities make the moody esports design much faster to implement; CSS Modules require more handwritten media queries |
| PandaScore API | Liquipedia API | If PandaScore CDL coverage is insufficient AND $49/month is acceptable |
| PandaScore API | Manual JSON | If no API has adequate CDL coverage — always keep this as fallback |
| Cloudflare Pages | Vercel Hobby | If you need server-side functions (not needed here). Vercel Hobby is non-commercial only, so Cloudflare Pages wins for a public app |
| date-fns | Day.js | Day.js has a similar API but weaker tree-shaking. date-fns is the better choice when you import specific functions like `format`, `formatInTimeZone` |
| date-fns | Luxon | Luxon is heavier (~23 KB gzipped) and overkill for a schedule display app |
| TanStack Query v5 | SWR | SWR is lighter but TanStack Query v5 has better devtools, retry logic, and staleTime control — all valuable for a schedule app with infrequent data changes |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | Unmaintained since 2020, ships the entire IANA timezone database in bundle (~329 KB). Will inflate mobile bundle size significantly | date-fns + @date-fns/tz |
| Create React App (CRA) | Officially deprecated by the React team in 2023, no longer maintained | Vite |
| Next.js | Adds SSR, server components, and routing complexity with no benefit for a static schedule display app. Deployment requires Node runtime (not pure static) | Vite + React |
| Web scraping callofdutyleague.com | Site is JS-rendered (React); requires headless browser (Playwright/Puppeteer); fragile to layout changes; breaks silently | PandaScore API or manual JSON |
| React Router (in MVP) | Unnecessary for a single-view schedule app; adds bundle weight and routing boilerplate | Omit until multi-page navigation is actually needed |
| Redux or Zustand | Global state management is over-engineering for a read-only schedule display. TanStack Query IS the state manager for server data | TanStack Query alone |
| Tailwind CSS v3 | v4 is GA since Jan 2025, significantly faster, better DX. v3 requires `tailwind.config.js` and is the old paradigm | Tailwind CSS v4 |

---

## Stack Patterns by Variant

**If PandaScore API has complete CDL coverage (happy path):**
- Fetch via TanStack Query with 5-minute staleTime (schedule doesn't change mid-day)
- Cache aggressively; background refetch on window focus
- Display loading skeleton while fetching

**If PandaScore API has incomplete CDL coverage:**
- Fall back to manual JSON in `src/data/schedule.json`
- Keep TanStack Query but point queryFn at a local JSON import
- No API calls at all — pure static deploy

**If the app grows to include team pages or match history:**
- Add React Router 7 for `/teams/:slug` and `/results` routes
- Still no SSR needed — Cloudflare Pages handles client-side routing via `_redirects` file

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react@19.2.4 | react-dom@19.2.4 | Must match exactly |
| vite@7.3.1 | Node >= 20.19 or >= 22.12 | Check Node version before scaffolding |
| tailwindcss@4.2.1 | @tailwindcss/vite plugin | Do NOT use PostCSS config approach from v3; use the Vite plugin |
| @tanstack/react-query@5.90.21 | React 18+ | v5 requires React 18 minimum; React 19 is fully supported |
| date-fns@4.1.0 | @date-fns/tz@1.x | Use together; date-fns v4 changed some internal APIs, verify @date-fns/tz is v4-compatible |

---

## Sources

- npm registry (live query 2026-02-28) — React 19.2.4, Vite 7.3.1, Tailwind 4.2.1, TanStack Query 5.90.21, date-fns 4.1.0 — HIGH confidence
- [Vite Getting Started](https://vite.dev/guide/) — Vite 7.3.1 stable, Node requirements — HIGH confidence
- [React versions page](https://react.dev/versions) — React 19.2.1 latest — HIGH confidence
- [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) — v4 GA Jan 2025, breaking changes, CSS-first config — HIGH confidence
- [PandaScore Pricing](https://www.pandascore.co/pricing) — Free fixtures tier, 1,000 req/hour, no CC — HIGH confidence (verified via official page)
- [PandaScore API Docs](https://developers.pandascore.co/docs/introduction) — Call of Duty listed in `call-of-duty.json` registry — MEDIUM confidence (listed but CDL match depth unverified)
- [Liquipedia API](https://liquipedia.net/api) — CDL covered, $49/month minimum — HIGH confidence (pricing from official page)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) — Unlimited bandwidth free tier, commercial use allowed — MEDIUM confidence (from search + docs)
- [Vercel Pricing](https://vercel.com/pricing) — 100 GB/month, non-commercial only Hobby plan — MEDIUM confidence
- [TanStack Query v5 docs](https://tanstack.com/query/v5/docs/framework/react/overview) — Data fetching patterns — HIGH confidence
- WebSearch: CDL scraper GitHub projects — confirmed web-scraper approach used in community projects (CDL-Wiki by Jpreet927 uses Python scraper) — LOW confidence (single source, may be outdated)

---

*Stack research for: CDL Schedule display app (mobile-first, esports)*
*Researched: 2026-02-28*
