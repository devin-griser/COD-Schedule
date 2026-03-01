# Requirements: CDL Schedule

**Defined:** 2026-02-28
**Core Value:** Users can instantly see the next upcoming CDL matches with teams, times, and stream links — nothing else getting in the way.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data

- [ ] **DATA-01**: App has a reliable source of CDL match schedule data (API or manual JSON)
- [ ] **DATA-02**: Match data includes teams, date/time (UTC), scores, stream links, and tournament context
- [ ] **DATA-03**: Team metadata (names, logos) is dynamic, not hardcoded in components

### Schedule Display

- [ ] **SCHED-01**: User can see a list of upcoming CDL matches in chronological order
- [ ] **SCHED-02**: User can see completed CDL matches with final scores
- [ ] **SCHED-03**: Upcoming and completed matches are visually distinct sections
- [ ] **SCHED-04**: Each match card shows both team names and logos
- [ ] **SCHED-05**: Each match card shows the match date and time in the user's local timezone
- [ ] **SCHED-06**: Each match card shows a stream link to watch live
- [ ] **SCHED-07**: Each match card shows tournament/stage context (e.g., "Major II Qualifiers — Week 3")

### Design

- [ ] **DSGN-01**: App uses a dark/moody theme with clean, sharp typography
- [ ] **DSGN-02**: Layout is mobile-first and responsive (works at 375px minimum, scales to desktop)
- [ ] **DSGN-03**: Page is clean and single-purpose — no ads, no marketing, no noise

### Extras

- [ ] **XTRA-01**: User can toggle spoiler mode to hide all match scores (persists via localStorage)
- [ ] **XTRA-02**: Completed matches show a VOD link to watch the replay

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: "Next match" hero card prominently displayed at top of page
- **ENH-02**: Countdown timer on next match card ("Match starts in 2h 34m")
- **ENH-03**: "Add to calendar" ICS export per match
- **ENH-04**: Match format label (Bo5, round info)
- **ENH-05**: Client-side "favorite team" filter via localStorage
- **ENH-06**: Stage/season navigation tabs

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No login needed — keeps app dead simple |
| Push notifications | ICS export solves reminders without infrastructure |
| Live real-time scores during matches | No CDL real-time API; link to stream instead |
| Player rosters / stats | Schedule-only app — roster data changes frequently |
| Historical season archives | Focus on upcoming/recent matches only |
| News feed / team updates | Scope creep — link out to external coverage if needed |
| Betting odds | Changes regulatory posture, inconsistent with clean aesthetic |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | — | Pending |
| DATA-02 | — | Pending |
| DATA-03 | — | Pending |
| SCHED-01 | — | Pending |
| SCHED-02 | — | Pending |
| SCHED-03 | — | Pending |
| SCHED-04 | — | Pending |
| SCHED-05 | — | Pending |
| SCHED-06 | — | Pending |
| SCHED-07 | — | Pending |
| DSGN-01 | — | Pending |
| DSGN-02 | — | Pending |
| DSGN-03 | — | Pending |
| XTRA-01 | — | Pending |
| XTRA-02 | — | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 ⚠️

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after initial definition*
