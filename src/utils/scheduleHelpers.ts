// src/utils/scheduleHelpers.ts
// Data transform utilities: filter, sort, and group CDL schedule matches

import type { Match, Team, TeamsData } from '../types/index'

export type GroupedMatches = Array<{ dateKey: string; label: string; matches: Match[] }>

/**
 * Partition matches into upcoming and completed groups.
 * Upcoming: status === 'scheduled' | 'live', sorted ascending by scheduledAt.
 * Completed: status === 'completed', sorted descending by scheduledAt (newest first).
 */
export function partitionMatches(matches: Match[]): { upcoming: Match[]; completed: Match[] } {
  const upcoming = matches
    .filter(m => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const completed = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return { upcoming, completed }
}

/**
 * Group an array of matches by calendar date in the user's timezone.
 * Uses a Map to preserve insertion order so date groups appear in the order matches were provided.
 * @param matches - Pre-sorted array of matches to group
 * @param timeZone - IANA timezone string (from useTimezone)
 * @param getKey - Function to get date key string for a UTC match time
 * @param getLabel - Function to get friendly date label for a UTC match time
 */
export function groupByDate(
  matches: Match[],
  timeZone: string,
  getKey: (utc: string, tz: string) => string,
  getLabel: (utc: string, tz: string) => string
): GroupedMatches {
  const groups = new Map<string, { label: string; matches: Match[] }>()
  for (const match of matches) {
    const key = getKey(match.scheduledAt, timeZone)
    if (!groups.has(key)) {
      groups.set(key, { label: getLabel(match.scheduledAt, timeZone), matches: [] })
    }
    groups.get(key)!.matches.push(match)
  }
  return Array.from(groups.entries()).map(([dateKey, g]) => ({ dateKey, ...g }))
}

/**
 * Build a Map of team id → Team for O(1) lookup when rendering match cards.
 */
export function buildTeamMap(teamsData: TeamsData): Map<string, Team> {
  return new Map(teamsData.teams.map(t => [t.id, t]))
}
