# Pitfalls Research

**Domain:** Esports schedule display app (CDL / web scraping / timezone display)
**Researched:** 2026-02-28
**Confidence:** MEDIUM — core pitfalls are well-documented across multiple sources; CDL-specific scraping details are LOW confidence due to limited public documentation of site internals

---

## Critical Pitfalls

### Pitfall 1: Scraping callofdutyleague.com as the Primary Data Source

**What goes wrong:**
The CDL website is a JavaScript SPA. Its schedule content is not in the initial HTML response — it is rendered client-side after JavaScript executes and fetches data from internal API endpoints. A naive scraper using `fetch()` or simple HTTP GET will receive a shell HTML document with no schedule data in it. Even Playwright/Puppeteer-based scrapers that correctly wait for JS to render are fragile: Activision can rotate internal API endpoint URLs, change response schemas, add Cloudflare Bot Management, or restructure the page DOM at any time with zero notice.

Additionally, CDL team names and branding change frequently. Between 2024 and 2026, nearly every original CDL franchise was renamed, relocated, or rebranded (Minnesota Rokkr → G2 Minnesota, Vegas Legion → Vegas Falcons → Riyadh Falcons, Toronto Ultra → Toronto KOI, etc.). Hardcoded team name strings or logo URLs tied to the official site will break mid-season.

**Why it happens:**
Developers assume a sports schedule site will have simple, stable HTML. CDL's site is built for browsers, not scrapers, and Activision has no obligation to keep internal structure stable.

**How to avoid:**
Do NOT build the app's core data pipeline on top of callofdutyleague.com HTML scraping. Use Liquipedia as the primary data source instead — it has a documented API (REST, OpenAPI 3), covers CDL data including matches, standings, teams, and tournaments, and is designed for community use. For a non-commercial, open-source personal project, Liquipedia offers free API access under CC-BY-SA 3.0. Rate limit all requests to ≤1 request per 2 seconds (≤1 per 30 seconds for `action=parse`). If Liquipedia API access cannot be arranged quickly, use Liquipedia as a scraping source (it is wiki HTML, far more stable than a React SPA) as a fallback — but pursue the API first.

**Warning signs:**
- Your scraper returns empty arrays or throws errors only when run in a Node.js context (not a real browser)
- Schedule data appears after a noticeable delay on the CDL site when you visit it in DevTools → Network tab shows XHR/Fetch calls to undocumented API endpoints
- CDL site responds with Cloudflare challenge pages (HTTP 403 or 503 with JS challenge)

**Phase to address:** Data pipeline phase (Phase 1 / foundation). This decision must be made before writing any frontend code. Choosing the wrong data source here requires a full backend rewrite.

---

### Pitfall 2: Storing or Displaying Match Times in the Wrong Timezone

**What goes wrong:**
Match times are published by CDL in a specific timezone (typically US Eastern for domestic events, or the local timezone of the Major city for international events). If you store these times as naive strings like "3:00 PM ET" and display them as-is, every user outside the Eastern timezone sees incorrect or confusing times. More subtly: storing UTC offsets as static numbers (e.g., `-5`) instead of IANA timezone identifiers causes DST failures — a match time stored as "UTC-5" is wrong for roughly half the year when Eastern time is actually UTC-4.

The JavaScript `Date` object does not store timezone information — it stores a Unix timestamp (UTC milliseconds). Parsing "2026-03-15 3:00 PM ET" without explicit timezone context will be parsed differently across browsers and environments, silently producing wrong results.

**Why it happens:**
Timezone handling looks simple until it isn't. Developers see "just add/subtract hours" as the approach and miss DST entirely. The JavaScript `Date` object's behavior — appearing to work locally, failing for users in other timezones — hides the bug until real users report it.

**How to avoid:**
- Store all match times as UTC ISO 8601 strings in your data layer (e.g., `"2026-03-15T20:00:00Z"`). Never store local time strings.
- Convert to the user's local timezone only at display time using `Intl.DateTimeFormat` with `timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone` to detect the user's IANA timezone automatically.
- Use IANA timezone names everywhere (e.g., `America/New_York`), never abbreviated names like `EST` or `CDT` — abbreviations are ambiguous (`CST` = both Central Standard Time and China Standard Time).
- Use `date-fns-tz` or `luxon` rather than raw `Date` manipulation to handle DST-aware conversions. Avoid `moment.js` (deprecated/unmaintained).
- Test with users in at least three different timezones during development. Use browser DevTools → Sensors to simulate different timezones.

**Warning signs:**
- Match times look correct in your local testing but users in other timezones report wrong times
- Times are off by exactly 1 hour near DST transition dates (March and November in the US)
- You have hardcoded `-5` or `-6` as timezone offsets anywhere in the codebase

**Phase to address:** Data modeling phase (Phase 1). The UTC-storage decision must be in the data schema before any data is ingested. The display-layer conversion must be in the first frontend component that renders match times.

---

### Pitfall 3: No Backend Proxy — Scraping Directly from the Browser

**What goes wrong:**
You try to call callofdutyleague.com or any third-party schedule source directly from the user's browser via `fetch()`. Browsers enforce CORS (Cross-Origin Resource Sharing): external sites that don't explicitly allow cross-origin requests will block the response. The data never reaches your app. This is not a bug you can fix on the frontend — it is a server-enforced restriction.

**Why it happens:**
New web developers assume `fetch()` works the same in a browser as `curl` in a terminal. It does not. CORS is enforced by the browser, not the target server.

**How to avoid:**
All data fetching from external sources must happen server-side — in a serverless function (Vercel Edge Function, Netlify Function, or Cloudflare Worker), not in the browser. The browser only calls your own backend endpoint, which returns clean schedule JSON. This also keeps any API keys, scraping logic, and data transformation logic out of the user's browser (where it can be inspected).

**Warning signs:**
- Browser console shows CORS errors (`Access-Control-Allow-Origin` missing)
- Data fetch works in Postman/curl but not in your browser app
- You are tempted to add a public CORS proxy (e.g., `corsproxy.io`) — this is a security and reliability anti-pattern for production

**Phase to address:** Architecture phase (Phase 1). The backend-proxy architecture must be decided upfront. Do not start building a purely static frontend that calls external APIs — that path ends in a rewrite.

---

### Pitfall 4: CDL Season/Team Data Hardcoded in the App

**What goes wrong:**
You hardcode team names, team logos (as static assets in your repo), team colors, or match format details into your frontend components. Midseason, CDL renames a team, replaces a logo, or adds an international team to the bracket. Your app displays stale branding or crashes on an unknown team ID.

This is not hypothetical: between the 2025 and 2026 seasons, every single original CDL franchise name was changed. If this app had been built in 2025 with hardcoded team data, it would have broken completely by the 2026 season start.

**Why it happens:**
Hardcoding is fast during initial build. Teams feel "stable" until they aren't. Logo URLs from official sites change when teams rebrand.

**How to avoid:**
- Team metadata (names, logos, colors) must come from the same data source as match schedules — not be hardcoded in components.
- Store team logos either by fetching from Liquipedia (which maintains up-to-date team assets) or by storing them in your own hosted asset store keyed by a stable team ID (not team name).
- Design your data schema to handle unknown teams gracefully: always have a fallback/placeholder logo and generic team name rendering, so an unrecognized team slug renders as "Unknown Team" rather than crashing.

**Warning signs:**
- Your codebase has a `teams.js` or `teamColors.js` file with 12 hardcoded entries
- Team logo `<img>` src values point to callofdutyleague.com CDN URLs (these can change or be removed without notice)
- A new CDL announcement causes you to manually edit multiple source files

**Phase to address:** Data modeling phase (Phase 1). Team metadata must be part of the data pipeline, not the frontend code.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode team list in frontend | No backend needed for team data | Breaks every season when teams rebrand | Never — takes 30 minutes to do it right |
| Store match times in local time strings ("3PM ET") | Simple to display | Wrong for all non-ET users; DST breaks it | Never — UTC is equally simple to implement |
| Scrape CDL site directly without a proxy layer | Fewer moving parts | CORS blocks it in browsers entirely; backend is required anyway | Never — CORS is a hard wall |
| Use public CORS proxy (corsproxy.io) | Quick to add | Third-party dependency, rate-limited, unreliable, exposes data flow to external service | MVP prototyping only; remove before public launch |
| Hardcode Liquipedia API key in frontend JS | Easy to test | Key exposed to all users, can be revoked if abused | Never — keys go in environment variables server-side |
| Poll data source on every page load | Always fresh data | Hits API rate limits fast; Liquipedia caps at 1 req/2 sec | Never — add a cache layer |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Liquipedia API | Scraping wiki HTML instead of using the API | Register for API access; use REST endpoints; respect rate limits (1 req/2s, 1/30s for parse actions) |
| Liquipedia API | Forgetting attribution requirement | CC-BY-SA 3.0 requires crediting Liquipedia as data source; add a visible "Data: Liquipedia" attribution in the app footer |
| Liquipedia API | Sending requests without a proper User-Agent header | API requires a descriptive User-Agent like `CDLScheduleApp/1.0 (https://yoursite.com; contact@example.com)` — requests without this may be blocked |
| CDL website | Directly fetching schedule HTML expecting static content | CDL is a React SPA — schedule content is loaded dynamically via XHR; static fetches return empty shell |
| Match time display | Using `new Date("2026-03-15 3:00 PM")` with no timezone | Parsing is browser/environment-dependent; always parse ISO 8601 with explicit Z or offset suffix |
| Team logos | Fetching logo URLs from callofdutyleague.com CDN | CDN URLs change on rebrands; use Liquipedia-sourced logos or self-host copies keyed by stable ID |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching fresh data from Liquipedia on every user page load | Slow page loads; Liquipedia rate limit errors (429) | Cache schedule data server-side with a TTL of 15-60 minutes; serve from cache to users | Immediately if multiple users hit the app concurrently |
| No loading state for schedule fetch | Page appears broken/empty on slow connections | Always show a skeleton/loading state while schedule data is in-flight | Every mobile user on a slow connection |
| Embedding large team logo images as base64 in JS bundle | Bundle size balloons; slow initial load on mobile | Serve logos as separate files with proper caching headers; use `loading="lazy"` on non-above-fold images | Any mobile device on < 5 Mbps connection |
| Re-rendering entire schedule list on every state update | Janky scroll on mobile | Use stable React keys; avoid unnecessary parent re-renders | Noticeable on match lists with 10+ items |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Embedding Liquipedia API key in frontend JavaScript | Key visible to anyone who views page source; can be stolen and rate-limit abused | Store API keys only in server-side environment variables (Vercel env vars, Netlify env vars); never in client-side code |
| Using a third-party public CORS proxy for production | All schedule requests route through an unknown third party; can be intercepted, rate-limited, or shut down | Use your own serverless function as the proxy |
| Scraping CDL site in a way that violates ToS | Potential cease-and-desist or IP block | Use Liquipedia API (designed for this); do not bypass authentication or anti-bot systems |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Displaying match times in ET only | ~70% of users see times that require mental math; international users are completely lost | Auto-detect browser timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone`; display in user's local time by default |
| No indicator of data freshness | User doesn't know if they're seeing today's schedule or last week's | Show "Last updated: X minutes ago" or a subtle timestamp near the schedule |
| 100vh layout on iOS Safari | Bottom content cut off by Safari toolbar; app feels broken on iPhone | Use `100dvh` (dynamic viewport height) with `100vh` fallback; test on actual iPhone Safari, not just desktop Chrome DevTools |
| Touch targets too small for match cards | Users misclick or can't tap stream links | Minimum 44x44px touch targets; link text and buttons should have generous padding; test on actual mobile device |
| Loading schedule data with no error state | Blank page if API is down or network fails | Always show a meaningful error state ("Could not load schedule — try again") with a retry option |
| Showing completed matches mixed with upcoming | Users scanning for "what's next" see irrelevant past data | Lead with upcoming matches; clearly separate "upcoming" from "results"; default scroll position at next upcoming match |

---

## "Looks Done But Isn't" Checklist

- [ ] **Timezone display:** Schedule shows correct times for users in PST, CST, GMT, and AEST — not just the developer's local timezone. Test by temporarily changing your OS timezone.
- [ ] **Data freshness:** Schedule auto-updates when CDL announces new matches or reschedules existing ones — not just on app redeploy.
- [ ] **Team rebranding:** App handles an unknown team slug gracefully (fallback logo, readable name) rather than showing a broken image or blank space.
- [ ] **Mobile Safari:** App is tested on actual iPhone Safari (not just Chrome DevTools device mode) — iOS Safari has unique viewport and rendering behaviors that simulators miss.
- [ ] **Empty state:** App shows a clear "No upcoming matches" state during CDL off-season rather than a blank or broken UI.
- [ ] **Stream links:** Match stream links (YouTube/Twitch) are verified to be live/working — not stale from a previous season's format.
- [ ] **Attribution:** Liquipedia attribution is visible in the UI per CC-BY-SA 3.0 license requirement.
- [ ] **Error state:** App shows a friendly error message if the data fetch fails — not a blank page or JavaScript error in the console.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Built on CDL site scraping, site structure changed | HIGH | Identify new DOM selectors or XHR endpoints via DevTools; update parser; consider migrating to Liquipedia API to avoid recurrence |
| Times stored in local strings, users report wrong times | HIGH | Migrate all stored times to UTC ISO 8601; update data pipeline ingestion; rewrite display layer to use timezone-aware formatting |
| Team data hardcoded, mid-season rebrand breaks app | MEDIUM | Update team data object; deploy; consider moving team metadata to data pipeline for future seasons |
| Liquipedia rate limit hit (429 errors) | LOW | Add or extend server-side caching TTL; verify User-Agent header is set correctly; reduce polling frequency |
| iOS Safari viewport layout broken | LOW | Replace `100vh` with `100dvh`; test fix on device; deploy |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Scraping CDL site directly | Phase 1: Data Pipeline | Can fetch live schedule data from Liquipedia API in a server environment without errors |
| Timezone storage as local strings | Phase 1: Data Modeling | All stored match timestamps are UTC ISO 8601; display layer converts to local timezone correctly for simulated PST user |
| CORS / no backend proxy | Phase 1: Architecture | Frontend fetches schedule from own serverless endpoint, not external URL directly |
| Hardcoded team data | Phase 1: Data Modeling | Removing one team from the data source causes graceful fallback, not a crash |
| No data cache layer | Phase 2: Backend | Multiple simultaneous user page loads do not each trigger a fresh Liquipedia API call |
| iOS Safari 100vh bug | Phase 2: UI | Schedule is fully visible on iPhone Safari without content cut off by browser toolbar |
| Touch target too small | Phase 2: UI | Stream link tap works reliably on iPhone with average-sized thumbs |
| No loading/error states | Phase 2: UI | Artificially slow network (DevTools throttling) shows loading state; blocking the API URL shows error state |

---

## Sources

- Liquipedia API documentation and terms: https://liquipedia.net/api and https://liquipedia.net/commons/Liquipedia:API_Usage_Guidelines
- CDL 2026 season rebrand details: https://www.esports.net/wiki/tournaments/cdl-2026-roadmap/ and https://cod-esports.fandom.com/wiki/Call_of_Duty_League/2026_Season (MEDIUM confidence — sourced from multiple fan wikis and esports press)
- Timezone handling pitfalls: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat and https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03 (HIGH confidence — MDN official)
- iOS Safari 100vh pitfall: https://allthingssmitty.com/2020/05/11/css-fix-for-100vh-in-mobile-webkit/ and https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a (HIGH confidence — well-documented, stable browser behavior)
- Web scraping fragility and CORS: https://crawlbase.com/blog/web-scraping-challenges-and-solutions/ and https://webscraping.ai/faq/apis/what-is-cors-and-how-does-it-affect-api-based-web-scraping (MEDIUM confidence)
- Legal context for sports data scraping: https://www.browserless.io/blog/is-web-scraping-legal and https://mccarthylg.com/is-web-scraping-legal-a-2025-breakdown-of-what-you-need-to-know/ (MEDIUM confidence)
- Serverless cold start comparison: https://punits.dev/blog/vercel-netlify-cloudflare-serverless-cold-starts/ (MEDIUM confidence)
- CSS class name instability in scrapers: https://medium.com/geekculture/bypass-scraping-websites-that-has-css-class-names-change-frequently-d4877ecd6d8f (LOW confidence — single source)

---
*Pitfalls research for: CDL Schedule Display App*
*Researched: 2026-02-28*
