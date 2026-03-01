// src/components/SchedulePage.tsx
// Root page component — orchestrates data loading, processing, and layout.
// LOCKED: Upcoming section first, Results below. Timezone shown once at top.
// LOCKED: Single scrollable page — no routing, no nav, no tabs.

import { useScheduleData } from '../hooks/useScheduleData.ts'
import { useTimezone } from '../hooks/useTimezone.ts'
import { partitionMatches, groupByDate, buildTeamMap } from '../utils/scheduleHelpers.ts'
import { getDateKey, formatDateLabel } from '../utils/dateHelpers.ts'
import { MatchSection } from './MatchSection.tsx'
import { SkeletonCard } from './SkeletonCard.tsx'
import { ErrorState } from './ErrorState.tsx'

export function SchedulePage() {
  const { data, isPending, isError, error } = useScheduleData()
  const { timeZone, displayName } = useTimezone()

  // Loading state — render skeleton cards in same page layout
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white">CDL Schedule</h1>
            <p className="text-xs text-gray-500 mt-1">All times in {displayName}</p>
          </header>
          <div className="flex flex-col gap-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <ErrorState message={error?.message} />
        </div>
      </div>
    )
  }

  // Data loaded — process and render full schedule
  const teamMap = buildTeamMap(data.teams)
  const { upcoming, completed } = partitionMatches(data.schedule.matches)
  const upcomingGroups = groupByDate(upcoming, timeZone, getDateKey, formatDateLabel)
  const completedGroups = groupByDate(completed, timeZone, getDateKey, formatDateLabel)

  return (
    // Outer: explicit bg (LOCKED: dark gray-950 background)
    <div className="min-h-screen bg-gray-950">
      {/* Content container: readable max-width, mobile padding */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header section: title + timezone shown ONCE at top (LOCKED) */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">CDL Schedule</h1>
          <p className="text-xs text-gray-500 mt-1">All times in {displayName}</p>
        </header>

        {/* LOCKED: Upcoming first, Results below — single scrollable page */}
        <MatchSection
          title="Upcoming"
          groups={upcomingGroups}
          teamMap={teamMap}
          timeZone={timeZone}
        />
        <MatchSection
          title="Results"
          groups={completedGroups}
          teamMap={teamMap}
          timeZone={timeZone}
        />
      </div>
    </div>
  )
}
