# Phase 2: Schedule Display - Research

**Researched:** 2026-03-01
**Domain:** React UI, Tailwind v4, date-fns timezone, static data loading
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Match card layout
- Side-by-side arrangement: home team left, away team right, score/time in center (classic esports scoreboard)
- Whole card is tappable — opens stream link on tap, no separate button/link target
- For completed matches: winner's score is bold/bright, loser's side is dimmed
- Full tournament context on every card: stage + round (e.g., "Stage 1 Major · Playoffs")

#### Page structure
- Single scrollable page, no tabs or routing
- Upcoming matches section first, Results section below
- Matches grouped by date within each section (date headers)
- Page starts at top — upcoming matches are immediately visible
- Results section ordered most recent first (reverse chronological)

#### Visual identity
- Dark gray background (Tailwind gray-950 range, not pure black) — softer, more depth
- Subtle team color accents on match cards (thin borders, logo glow, or tinted text — not overwhelming)
- Clean geometric typography (Inter or system sans-serif) — modern, readable, not sporty/aggressive
- Flat cards with subtle borders — no shadows, minimal and dense

#### Time and date display
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCHED-01 | User can see a list of upcoming CDL matches in chronological order | Data filtering by status=scheduled, sort by scheduledAt ascending, date grouping pattern |
| SCHED-02 | User can see completed CDL matches with final scores | Data filtering by status=completed, scores field from Match type, winner detection logic |
| SCHED-03 | Upcoming and completed matches are visually distinct sections | Two-section layout with section headers, Results below Upcoming |
| SCHED-04 | Each match card shows both team names and logos | TeamRef data from match, Team lookup by id, img onError fallback pattern |
| SCHED-05 | Each match card shows the match date and time in the user's local timezone | @date-fns/tz TZDate, Intl.DateTimeFormat().resolvedOptions().timeZone, format with locale |
| SCHED-06 | Each match card shows a stream link to watch live | Whole card as anchor element, streamUrl from Match type |
| SCHED-07 | Each match card shows tournament/stage context | tournament.stage + tournament.round from Match type, rendered on every card |
| DSGN-01 | App uses a dark/moody theme with clean, sharp typography | Tailwind gray-950 bg, Tailwind v4 always-dark strategy, Inter font or system-ui |
| DSGN-02 | Layout is mobile-first and responsive (works at 375px minimum, scales to desktop) | Tailwind default breakpoints (sm: 640px, md: 768px), base styles target 375px |
| DSGN-03 | Page is clean and single-purpose — no ads, no marketing, no noise | Single component tree, no router, no nav chrome |
</phase_requirements>

---

## Summary

Phase 2 is a pure frontend rendering challenge: take static JSON data already on disk (from Phase 1) and render it as a clean, dark, mobile-first schedule app. The technical domains are shallow — no API calls, no auth, no complex state — but they require getting several details right: timezone conversion, dynamic team color accents with Tailwind v4's CSS variable pattern, image fallback handling, and date grouping logic.

The stack is already installed and confirmed: React 19 + Tailwind v4 (@tailwindcss/vite plugin, CSS-first, no config file) + date-fns v4 + @date-fns/tz + @tanstack/react-query v5. All packages are in package.json. No new dependencies are needed for this phase. The only potential addition is Inter font (via Google Fonts or `font-display: swap` link in index.html).

The primary implementation risk is the dynamic team color accent pattern: Tailwind v4 cannot use runtime-dynamic class names (purged at build time), so team colors from teams.json must be applied via CSS custom properties in the `style` prop and referenced with Tailwind's `border-(--team-color)` shorthand syntax. This is a known v4 pattern — verified from official docs — and is straightforward once understood.

**Primary recommendation:** Build from the data layer outward — write pure data-transform utilities first (filter, sort, group), then compose the component tree top-down (App → SchedulePage → Section → DateGroup → MatchCard → TeamSlot). Keep all timezone logic in a single `useTimezone` hook. Keep all data-loading in a single `useScheduleData` hook.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | Component rendering | Already installed, project baseline |
| Tailwind CSS | 4.2.1 | All styling via utility classes | Already installed, @tailwindcss/vite plugin |
| date-fns | 4.1.0 | Date formatting, comparison | Already installed, v4 with native TZ support |
| @date-fns/tz | 1.4.1 | UTC→local timezone conversion | Already installed, pairs with date-fns v4 |
| @tanstack/react-query | 5.90.21 | Data loading with loading/error states | Already installed |
| TypeScript | 5.9.3 | Type safety | Already configured |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Inter font | N/A (CDN) | Clean geometric typography | Link in index.html head — zero bundle cost |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-query | Direct import (no query) | JSON is static — TanStack adds loading/error state management; justified for loading skeleton requirement |
| @date-fns/tz | Native Intl.DateTimeFormat | date-fns already installed; using it gives consistent formatting API for both time and date labels |
| CSS custom properties via style prop | Tailwind safelist | Safelisting team color classes for 12 teams × N utilities is fragile; CSS variable approach is canonical v4 pattern |

**Installation:**
```bash
# No new packages needed — all dependencies already in package.json
# Optional: add Inter font link to index.html (no npm install required)
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── hooks/
│   ├── useScheduleData.ts    # Loads schedule.json + teams.json via React Query
│   └── useTimezone.ts        # Detects browser timezone, returns tz string + display name
├── utils/
│   ├── scheduleHelpers.ts    # Filter, sort, group matches by date
│   └── dateHelpers.ts        # Format time, format date label ("Today", "Saturday, Mar 15")
├── components/
│   ├── SchedulePage.tsx      # Root page — timezone header + two sections
│   ├── MatchSection.tsx      # "Upcoming" or "Results" section with date groups
│   ├── DateGroup.tsx         # Date header + list of MatchCard items
│   ├── MatchCard.tsx         # Single match row: TeamSlot / Score / TeamSlot
│   ├── TeamSlot.tsx          # Logo + name, accepts team color for dynamic accent
│   ├── SkeletonCard.tsx      # Loading placeholder using animate-pulse
│   └── ErrorState.tsx        # Error state for data load failure
├── types/
│   └── index.ts              # Already exists from Phase 1 — do not modify
├── data/
│   ├── schedule.json         # Already exists from Phase 1
│   └── teams.json            # Already exists from Phase 1
├── App.tsx                   # Replaces placeholder — renders SchedulePage
├── index.css                 # @import "tailwindcss" + Inter font + dark mode override
└── main.tsx                  # No changes needed
```

### Pattern 1: Always-On Dark Theme (Tailwind v4)

**What:** Override Tailwind's `dark:` variant to always trigger via a `.dark` class on `<html>`, not `prefers-color-scheme`.

**When to use:** App has a permanent dark aesthetic — no light mode toggle needed.

**How it works:** In `src/index.css`, add the `@custom-variant` override. In `index.html`, add `class="dark"` to the `<html>` element.

```css
/* src/index.css */
@import "tailwindcss";

/* Override dark: variant — always active via .dark class on <html> */
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<!-- index.html -->
<html lang="en" class="dark">
```

Since the app is permanently dark, most classes won't need the `dark:` prefix — just write base dark styles directly (`bg-gray-950`, `text-white`). The `dark:` prefix is available for any future light-mode exceptions.

**Source:** https://tailwindcss.com/docs/dark-mode (official docs)

### Pattern 2: Dynamic Team Color Accents (Tailwind v4 + CSS Variables)

**What:** Apply per-team hex colors from `teams.json` as CSS custom properties via the `style` prop, then reference them in Tailwind utility classes using the `(--variable)` shorthand.

**When to use:** Any time a runtime value (not known at build time) drives a Tailwind color utility.

**Why this is necessary:** Tailwind v4 purges unused utilities at build time. Dynamic class names like `` `border-[${team.primaryColor}]` `` are never included in the CSS output. The CSS variable approach sidesteps purging entirely.

```tsx
// TeamSlot.tsx
interface TeamSlotProps {
  team: Team | 'TBD'
  side: 'home' | 'away'
}

function TeamSlot({ team, side }: TeamSlotProps) {
  if (team === 'TBD') {
    return <div className="flex items-center gap-2 text-gray-500">TBD</div>
  }

  return (
    <div
      className="flex items-center gap-2 border-l-2 border-(--team-color) pl-2"
      style={{ '--team-color': team.primaryColor } as React.CSSProperties}
    >
      <TeamLogo team={team} />
      <span className="text-sm font-medium text-white">{team.shortName}</span>
    </div>
  )
}
```

**Source:** https://tailwindcss.com/docs/adding-custom-styles (official docs — CSS variable shorthand)

### Pattern 3: Static JSON Loading with React Query

**What:** Use `useQuery` with a `queryFn` that does a direct `import()` of the JSON file. React Query provides `isPending`, `isError`, and `data` states.

**When to use:** Static data that doesn't change at runtime but benefits from loading/error state management.

```tsx
// hooks/useScheduleData.ts
import { useQuery } from '@tanstack/react-query'
import type { ScheduleData, TeamsData } from '../types'

export function useScheduleData() {
  return useQuery({
    queryKey: ['schedule'],
    queryFn: async (): Promise<{ schedule: ScheduleData; teams: TeamsData }> => {
      const [schedule, teams] = await Promise.all([
        import('../data/schedule.json'),
        import('../data/teams.json'),
      ])
      return {
        schedule: schedule.default as ScheduleData,
        teams: teams.default as TeamsData,
      }
    },
    staleTime: Infinity, // Static data — never re-fetch
  })
}
```

**Note on TypeScript:** Vite supports direct JSON ES module imports natively. The current `tsconfig.app.json` uses `"moduleResolution": "bundler"` which is incompatible with `resolveJsonModule: true`. Do NOT add `resolveJsonModule`. Instead, cast to the known type after import (`schedule.default as ScheduleData`). Vite handles the actual import; TypeScript type-checks the cast. The `noUncheckedSideEffectImports` flag in the current tsconfig does not block JSON imports.

**Source:** https://vite.dev/guide/features (Vite JSON imports), https://tanstack.com/query/v5/docs/framework/react/guides/queries (TanStack Query)

### Pattern 4: UTC to Local Timezone Conversion

**What:** Use `Intl.DateTimeFormat().resolvedOptions().timeZone` to get the browser's IANA timezone string. Use `TZDate` from `@date-fns/tz` to create a timezone-aware date, then `format` from `date-fns` to format it.

**When to use:** Any time a UTC ISO 8601 string (`scheduledAt`) must be rendered in the user's local time.

```tsx
// hooks/useTimezone.ts
export function useTimezone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  // Display name: short abbreviation like "EST", "PST", "CET"
  const displayName = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(new Date())
    .find(p => p.type === 'timeZoneName')?.value ?? timeZone

  return { timeZone, displayName }
}
```

```tsx
// utils/dateHelpers.ts
import { TZDate } from '@date-fns/tz'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'

export function formatMatchTime(
  utcString: string,
  timeZone: string,
  locale?: string
): string {
  const date = new TZDate(new Date(utcString), timeZone)
  // Use locale to auto-select 12h vs 24h based on user's browser locale
  return new Intl.DateTimeFormat(locale ?? navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

export function formatDateLabel(utcString: string, timeZone: string): string {
  const date = new TZDate(new Date(utcString), timeZone)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d') // "Saturday, March 15"
}

export function getDateKey(utcString: string, timeZone: string): string {
  const date = new TZDate(new Date(utcString), timeZone)
  return format(date, 'yyyy-MM-dd') // Used for grouping
}
```

**Source:** https://github.com/date-fns/tz (official @date-fns/tz repo), https://blog.date-fns.org/v40-with-time-zone-support/

### Pattern 5: Date Grouping (Upcoming and Results Sections)

**What:** Partition matches into upcoming/completed, then group each partition by calendar date in the user's timezone.

```tsx
// utils/scheduleHelpers.ts
import type { Match, Team, TeamsData } from '../types'

export type GroupedMatches = Array<{ dateKey: string; label: string; matches: Match[] }>

export function partitionMatches(matches: Match[]) {
  const upcoming = matches
    .filter(m => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const completed = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()) // newest first

  return { upcoming, completed }
}

export function groupByDate(
  matches: Match[],
  timeZone: string,
  getKey: (utc: string, tz: string) => string,
  getLabel: (utc: string, tz: string) => string
): GroupedMatches {
  const groups = new Map<string, { label: string; matches: Match[] }>()
  for (const match of matches) {
    const key = getKey(match.scheduledAt, timeZone)
    if (!groups.has(key)) {
      groups.set(key, { label: getLabel(match.scheduledAt, timeZone), matches: [] })
    }
    groups.get(key)!.matches.push(match)
  }
  return Array.from(groups.entries()).map(([dateKey, g]) => ({ dateKey, ...g }))
}

export function buildTeamMap(teamsData: TeamsData): Map<string, Team> {
  return new Map(teamsData.teams.map(t => [t.id, t]))
}
```

### Pattern 6: Image Fallback for Team Logos

**What:** React `<img>` with `onError` handler that switches to the fallback src. Guard against infinite loops if the fallback also fails.

```tsx
// components/TeamLogo.tsx
import { useState } from 'react'
import type { Team } from '../types'

interface TeamLogoProps {
  team: Team
  size?: number
}

export function TeamLogo({ team, size = 32 }: TeamLogoProps) {
  const [src, setSrc] = useState(team.logoPath)
  const [errored, setErrored] = useState(false)

  return (
    <img
      src={src}
      alt={team.shortName}
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={() => {
        if (!errored) {
          setErrored(true)
          setSrc(team.logoFallback)
        }
      }}
    />
  )
}
```

**Source:** Medium "The Safe Image Pattern" (2025) — avoid infinite loop when fallback also fails

### Pattern 7: Skeleton Loading Screens

**What:** Show skeleton cards during the React Query `isPending` state using Tailwind's `animate-pulse`.

```tsx
// components/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-3 border border-gray-800 rounded-lg">
      <div className="flex-1 flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-800 rounded-sm" />
        <div className="h-4 bg-gray-800 rounded w-20" />
      </div>
      <div className="h-6 bg-gray-800 rounded w-12" />
      <div className="flex-1 flex items-center gap-2 justify-end">
        <div className="h-4 bg-gray-800 rounded w-20" />
        <div className="w-8 h-8 bg-gray-800 rounded-sm" />
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Dynamic Tailwind class construction with team colors:** Never write `` `border-[${color}]` `` — these class names are purged at build time. Always use CSS custom properties via `style` prop + `border-(--variable)` Tailwind shorthand.
- **`resolveJsonModule: true` in tsconfig:** Incompatible with `moduleResolution: "bundler"`. Vite handles JSON imports natively — use `import('../data/schedule.json')` with a type cast.
- **Repeating timezone per card:** The user decision requires timezone shown once at the top of the page only — do not add "EST" to each time display.
- **Relative time ("in 3 hours"):** Explicitly out of scope per user decisions — show only the formatted absolute time.
- **Separate stream link button:** The whole card must be tappable as an anchor — no separate link/button element.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone conversion | Custom UTC offset math | `TZDate` from `@date-fns/tz` | DST transitions, edge cases around midnight, locale 12h/24h |
| Date formatting | String manipulation | `format` from `date-fns` | Locale-aware, handles all edge cases |
| Loading / error state | `useState` + `useEffect` fetch | `useQuery` from `@tanstack/react-query` | Deduplication, cache, error retry — already installed |
| Image fallback | CSS `::after` pseudo tricks | React `onError` + `useState` | Simple, reliable, framework-native |

**Key insight:** The only custom logic this phase needs is the data partitioning and grouping functions (`partitionMatches`, `groupByDate`). Everything else is handled by installed libraries.

---

## Common Pitfalls

### Pitfall 1: Tailwind Dynamic Class Purging

**What goes wrong:** Team primary colors from `teams.json` are runtime values. Writing `` className={`border-[${team.primaryColor}]`} `` generates class names Tailwind has never seen — they are purged and the styles never apply.

**Why it happens:** Tailwind v4 scans source files at build time for class name strings. Dynamically composed strings are invisible to the scanner.

**How to avoid:** Always inject dynamic colors as CSS custom properties in the `style` prop: `style={{ '--team-color': team.primaryColor }}`. Reference in Tailwind: `className="border-(--team-color)"`.

**Warning signs:** Border/color utilities working in dev but missing from production build, or no visual accent even in dev.

### Pitfall 2: Date Grouping Ignores Timezone

**What goes wrong:** Grouping matches by `scheduledAt.substring(0, 10)` (the UTC date portion) produces wrong groups for users in timezones that offset across midnight. A match at `2026-03-01T23:00:00Z` is on March 1 UTC but March 2 for someone in UTC+3.

**Why it happens:** Naive string slicing of ISO 8601 ignores the user's timezone.

**How to avoid:** Always convert `scheduledAt` to a `TZDate` in the user's timezone before extracting the date key with `format(date, 'yyyy-MM-dd')`.

**Warning signs:** Date headers don't match card times ("Saturday" header with a Saturday night time showing a different day's match).

### Pitfall 3: Locale 12h/24h Format

**What goes wrong:** Using `date-fns` `format` with hardcoded `h:mm a` or `HH:mm` pattern ignores the user's locale preference (CDL has EU fans who expect 24h).

**Why it happens:** `format` from date-fns uses the format string literally — it doesn't respect locale.

**How to avoid:** Use `Intl.DateTimeFormat` with `hour: 'numeric', minute: '2-digit'` and the user's locale (`navigator.language`). This auto-selects 12h vs 24h based on locale.

**Warning signs:** EU users (en-GB, de, fr) seeing "3:00 PM" instead of "15:00".

### Pitfall 4: Winner Detection Edge Case

**What goes wrong:** Assuming home team wins if `scores.home > scores.away`. This is correct for CDL Bo5 (highest series score wins), but the `scores` field may be missing for scheduled matches.

**How to avoid:** Guard `scores` access with optional chaining. For completed matches, `scores` is always present per the fixture data — but write defensive code: `match.scores?.home ?? 0`.

**Warning signs:** Runtime crash when rendering a scheduled match card in the completed section during data refresh transitions.

### Pitfall 5: TBD Opponent Rendering

**What goes wrong:** The `awayTeam: 'TBD'` union type (from the types locked in Phase 1) means team lookup via `teamMap.get(match.awayTeam.id)` throws a TypeError — strings don't have `.id`.

**How to avoid:** Always guard team access: `typeof match.homeTeam === 'string' ? null : teamMap.get(match.homeTeam.id)`.

**Warning signs:** Crash on the match-tbd-001 entry in `schedule.json`.

---

## Code Examples

### Complete MatchCard Structure

```tsx
// components/MatchCard.tsx
import type { Match, Team } from '../types'
import { TeamSlot } from './TeamSlot'

interface MatchCardProps {
  match: Match
  teamMap: Map<string, Team>
  timeZone: string
}

export function MatchCard({ match, teamMap, timeZone }: MatchCardProps) {
  const homeTeam = typeof match.homeTeam !== 'string'
    ? teamMap.get(match.homeTeam.id) ?? null
    : null
  const awayTeam = typeof match.awayTeam !== 'string'
    ? teamMap.get(match.awayTeam.id) ?? null
    : null

  const isCompleted = match.status === 'completed'
  const homeWins = isCompleted && match.scores
    ? match.scores.home > match.scores.away
    : null

  return (
    <a
      href={match.streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 transition-colors"
    >
      {/* Tournament context */}
      <div className="text-xs text-gray-500 mb-2">
        {match.tournament.stage} · {match.tournament.round}
      </div>

      {/* Teams + score/time */}
      <div className="flex items-center gap-3">
        <TeamSlot
          team={homeTeam}
          matchTeam={match.homeTeam}
          dimmed={homeWins === false}
        />
        <ScoreOrTime match={match} timeZone={timeZone} />
        <TeamSlot
          team={awayTeam}
          matchTeam={match.awayTeam}
          side="away"
          dimmed={homeWins === true}
        />
      </div>
    </a>
  )
}
```

### Timezone Display at Page Top

```tsx
// components/SchedulePage.tsx (header section)
const { timeZone, displayName } = useTimezone()

<p className="text-xs text-gray-500">All times in {displayName}</p>
```

### React Query Setup Required in main.tsx

`@tanstack/react-query` requires a `QueryClientProvider` at the root. This is a change to `main.tsx` (or wrapping in `App.tsx`):

```tsx
// src/main.tsx — updated
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for dark mode | `@custom-variant` in CSS, no config file | Tailwind v4 (2025) | No config file needed; CSS-first |
| `date-fns-tz` separate package | `@date-fns/tz` (official, scoped) | date-fns v4 (2024) | First-class TZ support; old `date-fns-tz` is for v2 only |
| `darkMode: 'class'` in tailwind config | `@custom-variant dark (&:where(.dark, .dark *))` in CSS | Tailwind v4 | Config key removed |
| `resolveJsonModule: true` in tsconfig | Vite native JSON imports | Vite 2+ | No tsconfig option needed; use cast after import |

**Deprecated/outdated:**
- `date-fns-tz` (unscoped npm package): For date-fns v2 only. The project uses date-fns v4 with `@date-fns/tz` (scoped). Do not import from `date-fns-tz`.
- `tailwind.config.js`: Not used in this project. Tailwind v4 is configured via CSS only.
- `postcss.config.js`: Not used. The `@tailwindcss/vite` plugin handles PostCSS integration.

---

## Open Questions

1. **Inter font delivery**
   - What we know: The user decision specifies "Inter or system sans-serif." Inter must be loaded from a CDN or bundled.
   - What's unclear: Whether Google Fonts CDN is acceptable in this project's deployment context (Cloudflare Pages has no restrictions, but Google Fonts adds an external dependency).
   - Recommendation: Add `<link>` for Inter from Google Fonts in `index.html`. If CDN is undesirable, `font-family: system-ui, -apple-system, sans-serif` as fallback delivers similar results — Claude's discretion per CONTEXT.md.

2. **Match card tap target on desktop**
   - What we know: "Whole card is tappable" — opens stream link on tap.
   - What's unclear: Whether an `<a>` wrapping the entire card causes accessibility issues (screen readers, keyboard navigation).
   - Recommendation: Use `<a>` element with `display: block` (Tailwind `block` class) — this is the simplest, most accessible approach. The card content does not include nested interactive elements, so no `role` override is needed.

3. **`noUncheckedSideEffectImports` and dynamic JSON imports**
   - What we know: The current `tsconfig.app.json` includes `"noUncheckedSideEffectImports": true`. Dynamic `import('../data/schedule.json')` is an ES module dynamic import, not a side-effect import.
   - What's unclear: Whether TypeScript 5.9 flags dynamic JSON imports under this rule.
   - Recommendation: Use dynamic import with explicit type cast. If TypeScript errors, add `// @ts-expect-error` with a comment, or switch to a synchronous static import at the module level (Vite handles both equally).

---

## Validation Architecture

> `workflow.nyquist_validation` not present in `.planning/config.json` — section skipped.

---

## Sources

### Primary (HIGH confidence)
- https://tailwindcss.com/docs/dark-mode — Tailwind v4 dark mode, `@custom-variant`, always-dark strategy
- https://tailwindcss.com/docs/adding-custom-styles — CSS variable shorthand `border-(--variable)` pattern
- https://vite.dev/guide/features — Vite native JSON ES module imports
- https://github.com/date-fns/tz — @date-fns/tz TZDate API, browser timezone detection
- https://tanstack.com/query/v5/docs/framework/react/guides/queries — useQuery with static data, `staleTime: Infinity`
- https://blog.date-fns.org/v40-with-time-zone-support/ — date-fns v4 first-class TZ support overview

### Secondary (MEDIUM confidence)
- https://tailwindcss.com/blog/tailwindcss-v4 — v4 CSS-first overview, no config files
- https://www.thomasledoux.be/blog/tailwind-setting-using-css-variables-react — CSS variable via style prop + Tailwind class combination in React
- https://medium.com/@nickyha/the-safeimage-pattern-a-common-react-mistake-6b83ea568a80 — Image fallback with errored guard

### Tertiary (LOW confidence)
- GitHub discussion on Tailwind v4 arbitrary values breaking changes — not verified with a specific fix; use CSS variable approach instead

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json, no new dependencies needed
- Architecture: HIGH — all patterns verified against official Tailwind v4 docs and Vite docs
- Tailwind CSS variable dynamic color: HIGH — verified from official Tailwind docs
- date-fns TZ conversion: HIGH — verified from official @date-fns/tz repo and blog post
- Pitfalls: HIGH — dynamic class purging and timezone grouping are well-documented Tailwind/date-fns gotchas
- Image fallback: MEDIUM — React pattern is standard; `errored` guard verified via 2025 blog post

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable libraries — Tailwind v4 and date-fns v4 APIs are stable)
