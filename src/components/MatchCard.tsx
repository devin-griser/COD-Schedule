// src/components/MatchCard.tsx
// Full match card — tappable anchor element wrapping all content (LOCKED DECISION).
// Shows tournament context, team slots with color accents, and score (completed) or time (scheduled/live).

import type { Match, Team } from '../types/index.ts'
import { formatMatchTime } from '../utils/dateHelpers.ts'
import { TeamSlot } from './TeamSlot.tsx'

interface MatchCardProps {
  match: Match
  teamMap: Map<string, Team>
  timeZone: string
}

export function MatchCard({ match, teamMap, timeZone }: MatchCardProps) {
  // Team lookup — guard against 'TBD' string (strings don't have .id — Pitfall 5)
  const homeTeam = typeof match.homeTeam !== 'string' ? (teamMap.get(match.homeTeam.id) ?? null) : null
  const awayTeam = typeof match.awayTeam !== 'string' ? (teamMap.get(match.awayTeam.id) ?? null) : null

  // Winner detection — only for completed matches with scores (Pitfall 4: optional chaining on scores)
  const isCompleted = match.status === 'completed'
  const homeWins = isCompleted && match.scores ? match.scores.home > match.scores.away : null

  // Center column content — score, time, or LIVE badge
  function renderCenter() {
    if (isCompleted) {
      return (
        <span className="text-lg font-bold text-white">
          {match.scores?.home ?? 0} - {match.scores?.away ?? 0}
        </span>
      )
    }
    if (match.status === 'live') {
      return <span className="text-sm font-bold text-green-400">LIVE</span>
    }
    // scheduled or postponed — show formatted match time
    return (
      <span className="text-sm text-gray-400">
        {formatMatchTime(match.scheduledAt, timeZone)}
      </span>
    )
  }

  return (
    // LOCKED DECISION: entire card is an <a> element — whole card is tappable
    <a
      href={match.streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 transition-colors"
    >
      {/* Tournament context row */}
      <div className="text-xs text-gray-500 mb-2">
        {match.tournament.stage} · {match.tournament.round}
      </div>

      {/* Teams + score/time row */}
      <div className="flex items-center">
        {/* Home team — left side */}
        <TeamSlot
          team={homeTeam}
          matchTeam={match.homeTeam}
          side="home"
          dimmed={homeWins === false}
        />

        {/* Center — score or time */}
        <div className="text-center min-w-[60px]">
          {renderCenter()}
        </div>

        {/* Away team — right side */}
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
