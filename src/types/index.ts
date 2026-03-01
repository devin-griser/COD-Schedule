// src/types/index.ts
// Data contracts for CDL Schedule — locked in Phase 1, consumed by Phase 2

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed'

export interface TeamRef {
  id: string        // stable slug, e.g. "optic-texas"
  name: string      // full name, e.g. "OpTic Texas"
  shortName: string // short name, e.g. "OpTic"
}

export interface TournamentContext {
  name: string    // e.g. "CDL 2026"
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
  streamUrl: string             // per-match stream link
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

// Schedule data file shape
export interface ScheduleData {
  version: string
  generatedAt: string
  matches: Match[]
}

// Teams data file shape
export interface TeamsData {
  teams: Team[]
}
