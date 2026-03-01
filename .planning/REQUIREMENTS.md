# Requirements: CDL Schedule

**Defined:** 2026-02-28
**Core Value:** Users can instantly see the next upcoming CDL matches with teams, times, and stream links — nothing else getting in the way.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data

- [x] **DATA-01**: App has a reliable source of CDL match schedule data (API or manual JSON)
- [x] **DATA-02**: Match data includes teams, date/time (UTC), scores, stream links, and tournament context
- [x] **DATA-03**: Team metadata (names, logos) is dynamic, not hardcoded in components

### Schedule Display

- [x] **SCHED-01**: User can see a list of upcoming CDL matches in chronological order
- [x] **SCHED-02**: User can see completed CDL matches with final scores
- [x] **SCHED-03**: Upcoming and completed matches are visually distinct sections
- [x] **SCHED-04**: Each match card shows both team names and logos
- [x] **SCHED-05**: Each match card shows the match date and time in the user's local timezone
- [x] **SCHED-06**: Each match card shows a stream link to watch live
- [x] **SCHED-07**: Each match card shows tournament/stage context (e.g., "Major II Qualifiers — Week 3")

### Design

- [x] **DSGN-01**: App uses a dark/moody theme with clean, sharp typography
- [x] **DSGN-02**: Layout is mobile-first and responsive (works at 375px minimum, scales to desktop)
- [x] **DSGN-03**: Page is clean and single-purpose — no ads, no marketing, no noise

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
| DATA-01 | Phase 1 | Complete (01-02) |
| DATA-02 | Phase 1 | Complete (01-01) |
| DATA-03 | Phase 1 | Complete (01-01) |
| SCHED-01 | Phase 2 | Complete (02-01) |
| SCHED-02 | Phase 2 | Complete (02-01) |
| SCHED-03 | Phase 2 | Complete (02-01) |
| SCHED-04 | Phase 2 | Complete (02-02) |
| SCHED-05 | Phase 2 | Complete (02-01) |
| SCHED-06 | Phase 2 | Complete (02-02) |
| SCHED-07 | Phase 2 | Complete (02-02) |
| DSGN-01 | Phase 2 | Complete (02-01) |
| DSGN-02 | Phase 2 | Complete (02-02) |
| DSGN-03 | Phase 2 | Complete (02-02) |
| XTRA-01 | Phase 3 | Pending |
| XTRA-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-03-01 after Plan 02-02 execution (SCHED-04, SCHED-06, SCHED-07, DSGN-02, DSGN-03 marked complete)*
