// src/components/MatchSection.tsx
// Renders a section with a title and date-grouped match cards.

import type { Team } from '../types/index.ts'
import type { GroupedMatches } from '../utils/scheduleHelpers.ts'
import { DateGroup } from './DateGroup.tsx'

interface MatchSectionProps {
  title: string
  groups: GroupedMatches
  teamMap: Map<string, Team>
  timeZone: string
}

export function MatchSection({ title, groups, teamMap, timeZone }: MatchSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {groups.length === 0 ? (
        <p className="text-gray-600 text-sm py-4">No matches to show</p>
      ) : (
        groups.map(g => (
          <DateGroup
            key={g.dateKey}
            dateLabel={g.label}
            matches={g.matches}
            teamMap={teamMap}
            timeZone={timeZone}
          />
        ))
      )}
    </section>
  )
}
