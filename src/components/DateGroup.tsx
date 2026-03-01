// src/components/DateGroup.tsx
// Renders a date header and a list of MatchCard items for one calendar date.

import type { Match, Team } from '../types/index.ts'
import { MatchCard } from './MatchCard.tsx'

interface DateGroupProps {
  dateLabel: string
  matches: Match[]
  teamMap: Map<string, Team>
  timeZone: string
}

export function DateGroup({ dateLabel, matches, teamMap, timeZone }: DateGroupProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-2 px-1">{dateLabel}</h3>
      <div className="flex flex-col gap-2">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} teamMap={teamMap} timeZone={timeZone} />
        ))}
      </div>
    </div>
  )
}
