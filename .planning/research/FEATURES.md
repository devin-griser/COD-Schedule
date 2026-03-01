# Feature Research

**Domain:** Esports schedule display app (CDL / Call of Duty League)
**Researched:** 2026-02-28
**Confidence:** MEDIUM — Competitor feature analysis is based on direct page inspection (VLR.gg, callofdutyleague.com, Liquipedia CDL, esports.gg) plus corroborating web research. CDL-specific data volume is well understood. UX pattern confidence is MEDIUM (multiple sources agree, not a single authoritative document).

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Team names + logos per match | Every competitor (VLR.gg, Liquipedia, official CDL site) shows this. Users identify teams visually first. | LOW | CDL has 12 stable teams with established branding. Logos are static assets — no dynamic fetching needed. |
| Match date and time display | Without this the page has zero utility. | LOW | Must show something humans can read, not Unix timestamps like callofdutyleague.com raw data does. |
| Local timezone conversion | VLR.gg, Liquipedia, and official CDL site all auto-convert. Users notice immediately when times are wrong for their location. | LOW | Browser `Intl.DateTimeFormat` handles this client-side — no server involvement needed. |
| "Upcoming" vs "Completed" match distinction | VLR.gg uses tabs (Schedule / Results). CDL site uses SCHEDULED / COMPLETED status. Users scan the page differently depending on which they want. | LOW | CSS/conditional rendering on match status field. Clear visual separation required. |
| Match scores for completed matches | VLR.gg, Liquipedia, and the CDL site all show final scores. Users checking results want the score immediately — not a click away. | LOW | Score is 2-3 integers. Display complexity is trivial; data availability depends on data source. |
| Stream link per match | VLR.gg has a Twitch link per match. CDL official site links to Twitch/YouTube per match. Liquipedia shows Twitch/YouTube stream icons. Missing this = users have to find the stream separately. | LOW | Static URL for CDL Twitch channel works for qualifier matches; direct per-match links are better for majors. |
| Chronological ordering | Obvious grouping. Matches out of order feel broken. | LOW | Sort by timestamp ascending for upcoming, descending for completed. |
| Tournament context per match | VLR.gg and Liquipedia both show which tournament/stage the match belongs to (e.g., "Major II Qualifiers – Week 3"). Without this, matches look decontextualized. | LOW | CDL has a defined stage structure (4 stages, Minors, Majors). A label string per match is sufficient. |
| Mobile-responsive layout | Sports schedules are checked on phones constantly. callofdutyleague.com is notoriously hard to use on mobile. | MEDIUM | Mobile-first CSS with readable card layout at 375px viewport minimum. |
| Dark theme | Standard for esports products. VLR.gg, Liquipedia, and the CDL site itself all use dark themes. Light theme on an esports schedule would feel tonally wrong. | LOW | CSS custom properties make this straightforward. |

### Differentiators (Competitive Advantage)

Features the official site and most competitors lack or do poorly. These are where this app wins.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Next match" hero — most prominent element on page | callofdutyleague.com buries the next match in nested tabs. A single, instantly visible "next match" card is the core UX win. | LOW | One card, top of page, always showing the chronologically next upcoming match. No tab hunting. |
| Match countdown timer | "Match starts in 2h 34m" is immediately useful context. VLR.gg shows countdown timers. The official CDL site does not display countdown prominently. | LOW | Client-side JS interval. Show hours/minutes for matches <24h away, show date for matches further out. |
| Spoiler toggle (hide scores) | VLR.gg has this (HIDDEN toggle). Fixtured sports calendar app has "No Spoilers Mode." Users who want to watch VODs later need this. CDL official site does not have it. | LOW | LocalStorage preference + CSS class toggle. All scores render as "---" when hidden. |
| Clean single-purpose layout — no ads, no pick'em, no news | callofdutyleague.com surrounds the schedule with hero banners, pick'em prompts, and marketing elements. This app's differentiator is radical simplicity. | LOW | Scope discipline, not a technical feature. |
| Match format display (Bo5, which stage/round) | Liquipedia shows "Bo3" or "Bo5" and round information. VLR.gg shows stage context. The official CDL site does not show format on match cards. CDL uses Bo5 for most matches. | LOW | Static data — CDL format is well-documented and changes per stage, not per match. |
| VOD link for completed matches | Liquipedia and VLR.gg both link to match VODs after completion. CDL official site shows "Watch Match VOD" for completed matches. This keeps the app useful after matches air. | MEDIUM | Requires knowing VOD URLs, which requires a data pipeline that captures them post-match. Defer to v1.x if data sourcing is manual. |
| "Add to calendar" export (ICS) | Multiple sports calendar apps (MySportsCal, Your Sports Calendar) show strong demand for this. Not available on the official CDL site. Low effort, high perceived value. | LOW | Generate .ics file client-side or server-side with match datetime. Standard format, well-supported. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good additions but actively work against this app's core value proposition.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live match tracking / real-time score updates during games | Obvious extension of a schedule app. Users watching live want scores. | Requires WebSocket or polling infrastructure, raises data costs, makes the app stateful. CDL has no public real-time API. Building this means building a data pipeline before you've validated the schedule display. Kills simplicity. | Link to the official CDL Twitch stream instead. Live tracking is not this app's job. |
| User accounts / personalization | "Follow my favorite team" is a natural request. | Authentication adds session management, a database, password reset flows. A schedule display app does not need a database of users. | Use localStorage to persist "favorite team" preference client-side. No account needed. |
| Push notifications for match reminders | Requested by fans who don't want to check manually. | Requires a service worker, push subscription management, a server to send notifications, and ongoing maintenance. Browser notification permission UX is hostile and users deny it. | "Add to calendar" ICS export solves the same problem more reliably with zero infrastructure. |
| News feed / team updates | Fans want context beyond the schedule. | Editorial content requires curation or an RSS feed integration. Scope creep that competes with established news sites (Dexerto, Dot Esports). | Link out to external coverage from the match card if contextually appropriate. |
| Player rosters per team | Schedule pages often link to team pages which list rosters. | The PROJECT.md explicitly excludes this. Roster data changes frequently (CDL has active transfer windows tracked on Liquipedia). Maintaining it is a content burden. | Out of scope. Link to the CDL official team page if needed. |
| Historical season archives | Full season history is a feature of Liquipedia and the CDL wiki. | CDL has seasons going back to 2020. Archiving all of it is a content/storage problem, not a display problem. Dilutes focus on "upcoming matches." | The PROJECT.md scopes this out. Show current season only. |
| Betting odds integration | ESPN app and many sports apps now integrate betting odds. | Changes the product's regulatory posture. Alienates users who don't want gambling content. Not consistent with the premium/clean aesthetic. | No alternative — just don't build it. |

---

## Feature Dependencies

```
[Local timezone conversion]
    └──requires──> [Match date/time display]

[Match countdown timer]
    └──requires──> [Match date/time display]
    └──requires──> [Local timezone conversion]

[Spoiler toggle]
    └──requires──> [Scores for completed matches]

[VOD link]
    └──requires──> [Completed match detection]
    └──requires──> [Data pipeline captures VOD URLs post-match]

["Add to calendar" ICS export]
    └──requires──> [Match date/time data]

["Next match" hero card]
    └──requires──> [Chronological ordering]
    └──enhances──> [Match countdown timer]

[Stream link]
    └──enhances──> ["Next match" hero card] (most useful on the most prominent card)

[Tournament context label]
    └──enhances──> [Upcoming vs completed distinction] (labels make the grouping clearer)
```

### Dependency Notes

- **Countdown timer requires accurate timezone conversion:** If local time is wrong, countdown is wrong. Get timezone right first.
- **Spoiler toggle requires scores to exist:** There is nothing to hide if completed match scores are not displayed. Build scores first.
- **VOD links are data-pipeline dependent:** If the data source is manual entry or scraping, VOD URLs must be captured post-match. This is a data discipline problem, not a display problem. Safe to defer.
- **"Next match" hero card is the highest-leverage feature:** It requires only sorted match data plus countdown timer. All other features are enhancements around it.

---

## MVP Definition

### Launch With (v1)

Minimum viable product. The official CDL site exists — this app must be immediately better in at least these ways to justify existence.

- [ ] Match list: teams, date/time, stream link — core display
- [ ] Local timezone conversion — users in non-ET timezones cannot use the app without this
- [ ] "Next match" hero card at top of page — the core UX differentiator
- [ ] Match countdown timer on the next match card — what makes the app feel alive
- [ ] Upcoming vs completed distinction with scores for completed — complete schedule experience
- [ ] Tournament/stage context label per match — without this, matches look disconnected
- [ ] Team logos — visual identity is expected; text-only feels half-finished
- [ ] Dark theme with clean typography — the aesthetic is the point; a light default theme would miss the product vision
- [ ] Mobile-responsive layout — mobile is the primary use case (checking schedule quickly)

### Add After Validation (v1.x)

Add once v1 has real users and confirmed that the schedule display itself is working.

- [ ] Spoiler toggle — add when users report watching VODs and wanting to avoid spoilers
- [ ] "Add to calendar" ICS export — add when users ask "how do I get reminders?" (low cost, high value)
- [ ] VOD links for completed matches — add once data pipeline reliably captures VOD URLs
- [ ] Match format label (Bo5, round) — add if users report wanting context about what kind of match it is

### Future Consideration (v2+)

Defer until product-market fit is clear. These require scope expansion.

- [ ] Client-side "favorite team" filter via localStorage — only needed if 12 teams creates noise; CDL has a small enough team count that it may never be needed
- [ ] Season-level navigation (Stage 1 / Stage 2 / Stage 3 / Stage 4) — CDL has 4 stages per season; useful for browsing past stages but not critical for "upcoming matches" use case
- [ ] Historical season archive — out of scope per PROJECT.md; reconsider only if user demand is strong

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Match list (teams, time, stream link) | HIGH | LOW | P1 |
| Local timezone conversion | HIGH | LOW | P1 |
| "Next match" hero card | HIGH | LOW | P1 |
| Match countdown timer | HIGH | LOW | P1 |
| Team logos | HIGH | LOW | P1 |
| Upcoming vs completed distinction | HIGH | LOW | P1 |
| Scores for completed matches | HIGH | LOW | P1 |
| Tournament/stage context label | MEDIUM | LOW | P1 |
| Dark theme | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Spoiler toggle | MEDIUM | LOW | P2 |
| "Add to calendar" ICS export | MEDIUM | LOW | P2 |
| VOD links for completed matches | MEDIUM | MEDIUM | P2 |
| Match format label (Bo5/round) | LOW | LOW | P2 |
| Favorite team filter (localStorage) | LOW | LOW | P3 |
| Stage/season navigation tabs | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | callofdutyleague.com | VLR.gg (schedule) | Liquipedia CDL | Our Approach |
|---------|---------------------|-------------------|----------------|--------------|
| Team names | Yes | Yes | Yes | Yes |
| Team logos | Yes | Yes | Yes | Yes |
| Local timezone | Yes (claimed) | Implicit (browser) | Shows timezone in label (e.g., "20:00 ICT") | Auto-convert, show in user's local time with timezone label |
| Countdown timer | No | Yes ("14h 49m") | No | Yes — primary "next match" card |
| "Next match" prominent | No (buried in tabs) | No (flat list) | No (flat list) | Yes — hero card at top of page |
| Tournament context | Yes (tab-based) | Yes | Yes | Yes — label per match card |
| Stream links | Yes (Twitch/YouTube) | Not visible on main schedule | Yes (Twitch/YouTube icons) | Yes — direct link per match card |
| Scores for completed | Not on card view | On results tab | Yes | Yes — visible on card |
| Match format (Bo5) | No | No (on VLR.gg, yes) | Yes | P2 — defer to v1.x |
| Spoiler toggle | No | Yes | No | P2 — add post-launch |
| VOD links | Yes ("Watch Match VOD") | Pending label | Yes | P2 — depends on data pipeline |
| Add to calendar | No | No | No | P2 — differentiator worth adding |
| Dark mode | Yes | Yes (toggle) | Yes | Yes — default, no toggle needed for v1 |
| Mobile layout | Poor | Adequate | Poor | Primary design target |
| Clean / ad-free | No (marketing noise) | Moderate (ads) | Moderate (wiki structure) | Core value — zero noise |

---

## Sources

- callofdutyleague.com/en-us/schedule — direct page inspection (2026-02-28)
  - Revealed: tab-based nested navigation, Unix timestamp data, SCHEDULED/COMPLETED statuses, Twitch stream links, no countdown timer, no spoiler mode
- vlr.gg/matches — direct page inspection (2026-02-28)
  - Revealed: countdown timers ("14h 49m"), team logos, tournament context, spoiler toggle, dark mode toggle, stats/VOD pending labels, pagination
- liquipedia.net/callofduty — direct page inspection (2026-02-28)
  - Revealed: upcoming/completed sections, stream icons (Twitch/YouTube), Bo3/Bo5 labels, VOD links, tournament tier labels
- esports.gg CDL 2026 schedule guide (2026-02-28)
  - Revealed: season structure, 4 stages, Majors format, 12 teams
- WebSearch: "Fixtured: Sports Calendar App" — spoiler mode, no-spoilers UX pattern (MEDIUM confidence)
- WebSearch: sports calendar ICS export pattern — MySportsCal, Your Sports Calendar (MEDIUM confidence)
- WebSearch: CDL 2026 season format — dotesports, esports.net, gamingtrend (MEDIUM confidence, multiple sources agree)
- liquipedia.net/callofduty/Call_of_Duty_League/Season_7 — CDL 2026 season structure details (MEDIUM confidence)

---
*Feature research for: CDL schedule display app (esports)*
*Researched: 2026-02-28*
