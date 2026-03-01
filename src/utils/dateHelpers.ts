// src/utils/dateHelpers.ts
// Timezone-aware date formatting utilities for CDL Schedule
// Uses TZDate from @date-fns/tz for all timezone conversions (Pitfall 2: never slice UTC string directly)
// Uses Intl.DateTimeFormat for time formatting to respect locale 12h/24h preference (Pitfall 3: not date-fns format)

import { TZDate } from '@date-fns/tz'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'

/**
 * Format a UTC ISO string to a locale-aware time string in the given timezone.
 * Uses Intl.DateTimeFormat with navigator.language to auto-select 12h vs 24h format.
 * Do NOT use date-fns `format` here — it ignores locale 12h/24h preference.
 */
export function formatMatchTime(utcString: string, timeZone: string): string {
  const date = new TZDate(new Date(utcString), timeZone)
  return new Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

/**
 * Format a UTC ISO string to a friendly date label ("Today", "Tomorrow", "Yesterday",
 * or "Saturday, March 15" for other dates) in the given timezone.
 */
export function formatDateLabel(utcString: string, timeZone: string): string {
  const date = new TZDate(new Date(utcString), timeZone)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d')
}

/**
 * Get a date key string (yyyy-MM-dd) in the given timezone for grouping matches by date.
 * MUST use TZDate — never slice the UTC string directly (Pitfall 2).
 */
export function getDateKey(utcString: string, timeZone: string): string {
  const date = new TZDate(new Date(utcString), timeZone)
  return format(date, 'yyyy-MM-dd')
}
