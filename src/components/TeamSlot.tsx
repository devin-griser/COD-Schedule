// src/components/TeamSlot.tsx
// Team logo + name with dynamic color accent via CSS custom property.
// Handles TBD opponent and null team (defensive fallback).
// Away side reverses flex layout so logo appears on the right.

import type { Team } from '../types/index.ts'
import type { TeamRef } from '../types/index.ts'
import { TeamLogo } from './TeamLogo.tsx'

interface TeamSlotProps {
  team: Team | null
  matchTeam: TeamRef | 'TBD'
  side?: 'home' | 'away'
  dimmed?: boolean
}

export function TeamSlot({ team, matchTeam, side = 'home', dimmed = false }: TeamSlotProps) {
  // TBD opponent — render placeholder text, no logo, no color accent
  if (matchTeam === 'TBD') {
    return (
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">TBD</span>
      </div>
    )
  }

  // Null team — team not in teamMap, render shortName without logo (defensive fallback)
  if (team === null) {
    return (
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-400">{matchTeam.shortName}</span>
      </div>
    )
  }

  // Full team rendering with color accent via CSS custom property
  // CRITICAL: Never use border-[${team.primaryColor}] — purged at build time.
  // Use style={{ '--team-color': color }} + className="border-(--team-color)" (Tailwind v4 pattern).
  const isAway = side === 'away'

  return (
    <div
      className={[
        'flex-1 flex items-center gap-2',
        isAway ? 'flex-row-reverse justify-end' : '',
        isAway ? 'border-r-2 border-(--team-color) pr-2' : 'border-l-2 border-(--team-color) pl-2',
        dimmed ? 'opacity-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--team-color': team.primaryColor } as React.CSSProperties}
    >
      <TeamLogo team={team} size={32} />
      <span className="text-sm font-medium text-white">{team.shortName}</span>
    </div>
  )
}
