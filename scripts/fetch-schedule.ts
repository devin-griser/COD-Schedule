/**
 * scripts/fetch-schedule.ts
 * Fetches CDL match data from PandaScore and normalizes it to the Match interface.
 * Run with: npx tsx scripts/fetch-schedule.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import type { Match, MatchStatus, TeamRef, ScheduleData } from '../src/types/index.js'

// ---------------------------------------------------------------------------
// Load .env.local (avoids adding dotenv dependency)
// ---------------------------------------------------------------------------
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
} catch { /* .env.local not found — rely on existing env */ }

// ---------------------------------------------------------------------------
// Auth check
// ---------------------------------------------------------------------------
const token = process.env.PANDASCORE_TOKEN
if (!token) {
  console.error('ERROR: Set PANDASCORE_TOKEN in .env.local')
  console.error('  1. Sign up at https://pandascore.co')
  console.error('  2. Go to Dashboard -> API Access -> Copy token')
  console.error('  3. Add to .env.local:  PANDASCORE_TOKEN=your_token_here')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Types for PandaScore raw responses
// ---------------------------------------------------------------------------
interface PandaScoreOpponent {
  opponent: {
    id: number
    name: string
    slug: string
  }
  type: string
}

interface PandaScoreResult {
  score: number
  team_id: number
}

interface PandaScoreStream {
  raw_url: string
  main: boolean
  language: string
}

interface PandaScoreMatch {
  id: number
  name: string
  status: string
  scheduled_at: string | null
  begin_at: string | null
  end_at: string | null
  opponents: PandaScoreOpponent[]
  results: PandaScoreResult[]
  streams_list: PandaScoreStream[]
  league: { id: number; name: string; slug: string } | null
  serie: { id: number; full_name: string; slug: string } | null
  tournament: { id: number; name: string; slug: string } | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function deriveShortName(name: string): string {
  // Known CDL team abbreviations
  const abbreviations: Record<string, string> = {
    'OpTic Texas': 'OpTic',
    'Atlanta FaZe': 'FaZe',
    'Boston Breach': 'Breach',
    'Carolina Royal Ravens': 'Ravens',
    'Las Vegas Legion': 'Legion',
    'Los Angeles Guerrillas': 'Guerrillas',
    'Los Angeles Thieves': 'Thieves',
    'Miami Heretics': 'Heretics',
    'Minnesota ROKKR': 'ROKKR',
    'New York Subliners': 'Subliners',
    'Seattle Surge': 'Surge',
    'Toronto Ultra': 'Ultra',
  }
  if (abbreviations[name]) return abbreviations[name]
  // Fallback: last word of the name
  const words = name.split(' ')
  return words[words.length - 1]
}

function mapStatus(raw: string): MatchStatus {
  switch (raw) {
    case 'not_started': return 'scheduled'
    case 'running':     return 'live'
    case 'finished':    return 'completed'
    case 'canceled':    return 'postponed'
    default:            return 'scheduled'
  }
}

function normalizeOpponent(opp: PandaScoreOpponent | undefined): TeamRef | 'TBD' {
  if (!opp || !opp.opponent) return 'TBD'
  const name = opp.opponent.name
  return {
    id: toSlug(name),
    name,
    shortName: deriveShortName(name),
  }
}

function normalizeMatch(m: PandaScoreMatch): Match {
  const status = mapStatus(m.status)
  const homeTeam = normalizeOpponent(m.opponents?.[0])
  const awayTeam = normalizeOpponent(m.opponents?.[1])

  let scores: Match['scores']
  if (status === 'completed' && m.results && m.results.length >= 2) {
    scores = {
      home: m.results[0]?.score ?? 0,
      away: m.results[1]?.score ?? 0,
    }
  }

  const streamUrl =
    m.streams_list?.find(s => s.main)?.raw_url ??
    m.streams_list?.[0]?.raw_url ??
    'https://www.twitch.tv/callofdutyleague'

  return {
    id: String(m.id),
    status,
    scheduledAt: m.scheduled_at ?? m.begin_at ?? '',
    homeTeam,
    awayTeam,
    scores,
    streamUrl,
    tournament: {
      name:  m.league?.name       ?? 'CDL 2026',
      stage: m.serie?.full_name   ?? '',
      round: m.tournament?.name   ?? '',
    },
  }
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------
async function fetchEndpoint(url: string, label: string): Promise<PandaScoreMatch[]> {
  console.log(`\nFetching ${label}...`)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`PandaScore ${label} returned ${res.status}: ${await res.text()}`)
  }
  const data = await res.json() as PandaScoreMatch[]
  console.log(`  -> ${data.length} matches returned`)
  return data
}

async function main() {
  console.log('=== PandaScore CDL Data Validation ===')

  // 1. Fetch upcoming and past matches
  const [upcoming, past] = await Promise.all([
    fetchEndpoint('https://api.pandascore.co/codmw/matches/upcoming?per_page=50', 'upcoming'),
    fetchEndpoint('https://api.pandascore.co/codmw/matches/past?per_page=50', 'past'),
  ])

  const all = [...upcoming, ...past]
  console.log(`\nTotal combined: ${all.length} matches`)

  // 2. Diagnostic: unique league names
  const leagueNames = [...new Set(all.map(m => m.league?.name ?? '(no league)').filter(Boolean))]
  console.log('\nUnique league names found:')
  for (const name of leagueNames) {
    const count = all.filter(m => m.league?.name === name).length
    console.log(`  "${name}" — ${count} matches`)
  }

  // 3. Sample first match's league/serie/tournament fields
  if (all.length > 0) {
    const sample = all[0]
    console.log('\nSample match (first result) league/serie/tournament fields:')
    console.log(`  league:     ${JSON.stringify(sample.league)}`)
    console.log(`  serie:      ${JSON.stringify(sample.serie)}`)
    console.log(`  tournament: ${JSON.stringify(sample.tournament)}`)
    console.log(`  status:     ${sample.status}`)
    console.log(`  scheduled_at: ${sample.scheduled_at}`)
  }

  // 4. Filter for CDL matches
  const cdlKeywords = ['Call of Duty League', 'CDL']
  const cdlMatches = all.filter(m => {
    const leagueName = m.league?.name ?? ''
    return cdlKeywords.some(kw => leagueName.includes(kw))
  })

  console.log(`\nCDL filter results: ${cdlMatches.length} CDL matches found`)
  if (cdlMatches.length === 0) {
    console.log('  WARNING: 0 CDL matches found after filtering.')
    console.log('  All league names seen above — check if CDL uses a different name.')
  } else {
    // Show CDL match sample
    console.log(`\nFirst CDL match:`)
    const first = cdlMatches[0]
    console.log(`  ID: ${first.id}`)
    console.log(`  Name: ${first.name}`)
    console.log(`  Status: ${first.status}`)
    console.log(`  League: ${first.league?.name}`)
    console.log(`  Serie: ${first.serie?.full_name}`)
    console.log(`  Tournament: ${first.tournament?.name}`)
    console.log(`  Scheduled: ${first.scheduled_at ?? first.begin_at}`)
  }

  // 5. Normalize all CDL matches
  const normalizedMatches: Match[] = cdlMatches.map(normalizeMatch)

  // 6. Write schedule.json
  const scheduleData: ScheduleData = {
    version: '1',
    generatedAt: new Date().toISOString(),
    matches: normalizedMatches,
  }

  const outPath = resolve(process.cwd(), 'src/data/schedule.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(scheduleData, null, 2), 'utf-8')

  // 7. Summary
  console.log(`\n=== Done ===`)
  console.log(`Wrote ${normalizedMatches.length} matches to src/data/schedule.json`)
  if (normalizedMatches.length === 0) {
    console.log('Note: schedule.json contains empty matches array (no CDL data found from API)')
    console.log('Next step: Choose data strategy — manual JSON entry or investigate API further')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
