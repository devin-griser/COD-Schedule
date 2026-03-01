// src/hooks/useTimezone.ts
// Detects browser timezone and returns IANA timezone string + short display name.

import { useMemo } from 'react'

interface TimezoneResult {
  timeZone: string
  displayName: string
}

/**
 * Returns the browser's detected timezone and a short display name (e.g., "EST", "PST", "CET").
 * Both values are memoized — computed once per component mount.
 */
export function useTimezone(): TimezoneResult {
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  const displayName = useMemo(
    () =>
      new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'short' })
        .formatToParts(new Date())
        .find(p => p.type === 'timeZoneName')?.value ?? timeZone,
    [timeZone]
  )

  return { timeZone, displayName }
}
