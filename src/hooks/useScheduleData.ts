// src/hooks/useScheduleData.ts
// Loads schedule.json and teams.json via React Query with loading/error state management.
// Uses dynamic imports — Vite handles JSON natively (no resolveJsonModule in tsconfig needed).

import { useQuery } from '@tanstack/react-query'
import type { ScheduleData, TeamsData } from '../types/index'

interface ScheduleQueryResult {
  schedule: ScheduleData
  teams: TeamsData
}

/**
 * Loads CDL schedule and teams data.
 * Static data — staleTime: Infinity means it is fetched once and never re-fetched.
 * Returns the full useQuery result with isPending, isError, and data.
 */
export function useScheduleData() {
  return useQuery<ScheduleQueryResult>({
    queryKey: ['schedule'],
    queryFn: async (): Promise<ScheduleQueryResult> => {
      const [scheduleModule, teamsModule] = await Promise.all([
        import('../data/schedule.json'),
        import('../data/teams.json'),
      ])
      return {
        schedule: scheduleModule.default as ScheduleData,
        teams: teamsModule.default as TeamsData,
      }
    },
    staleTime: Infinity,
  })
}
