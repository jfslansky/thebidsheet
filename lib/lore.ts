import { Redis } from '@upstash/redis'
import type { Story } from './types'

const KEY = 'bid:lore'

export interface Lore {
  sourceClickRates: Record<string, number>
  signalClickRates: Record<string, number>
  dynamicSignals: string[]
  daysFilingBase: number
  daysFilingEpoch: string
  itemsFlagged: number
  sourcesMonitored: number
  sinclairLocation: string
  sinclairLocationQualifier: string
  conventionMonth: string
  investigationStart: string
  boardMembers: string
  boardMemberNote: string | null
  compositeRoom: string | null
  sinclairCurrentTopic: string
  sinclairLastContact: string
  sinclairNoteCount: number
  sinclairSubmissionSeed: number
}

const DEFAULTS: Lore = {
  sourceClickRates: {},
  signalClickRates: {},
  dynamicSignals: [],
  daysFilingBase: 1890,
  daysFilingEpoch: '2026-04-18',
  itemsFlagged: 5234,
  sourcesMonitored: 14,
  sinclairLocation: 'Nashville, TN',
  sinclairLocationQualifier: 'as of last filing',
  conventionMonth: 'AUG',
  investigationStart: 'fall 2022',
  boardMembers: 'three',
  boardMemberNote: null,
  compositeRoom: null,
  sinclairCurrentTopic: 'the session D minutes',
  sinclairLastContact: 'nine days ago',
  sinclairNoteCount: 287,
  sinclairSubmissionSeed: 0,
}

const SINCLAIR_LOCATIONS = [
  'Nashville, TN',
  'Nashville, TN',
  'Nashville, TN',
  'Atlanta, GA',
  'Tuscaloosa, AL',
  'Nashville, TN',
  'Oxford, MS',
]

const SINCLAIR_QUALIFIERS = [
  'as of last filing',
  'as of last verified contact',
  'unconfirmed',
  'as of last filing',
  'location services disabled',
  'as of last filing',
]

const SINCLAIR_TOPICS = [
  'the session D minutes',
  'the composite discrepancy',
  'the pledge educator restructuring',
  'the alumni advisory board composition',
  'the spring 2022 big/little assignments',
  'the national dues restructure',
  'the risk management manual revision',
  'the spring 2023 retreat cancellation',
  'the nationals attendee list',
  'the standards hearing notice',
]

const SINCLAIR_LAST_CONTACTS = [
  'nine days ago',
  'this morning',
  'three days ago',
  'last week',
  'seventeen days ago',
  'sometime last month',
  'recently, from a different number',
]

const CONVENTION_MONTHS = ['AUG', 'AUG', 'JUL', 'AUG', 'AUG']

const INVESTIGATION_STARTS = ['fall 2022', 'fall 2022', 'spring 2022', 'fall 2022']

const BOARD_STATES = [
  { count: 'three', note: null },
  { count: 'three', note: null },
  { count: 'four', note: 'one appointment is described as provisional' },
  { count: 'three', note: null },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function getLore(): Promise<Lore> {
  const redis = getRedis()
  if (!redis) return DEFAULTS
  const stored = await redis.get<Lore>(KEY)
  if (!stored) return DEFAULTS
  return { ...DEFAULTS, ...stored }
}

export function getDaysFilingCount(lore: Lore): number {
  const epoch = new Date(lore.daysFilingEpoch).getTime()
  const now = Date.now()
  const daysSinceEpoch = Math.floor((now - epoch) / (1000 * 60 * 60 * 24))
  return lore.daysFilingBase + daysSinceEpoch
}

export async function mutateLore(): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  const current = await getLore()
  const boardState = pick(BOARD_STATES)

  const updated: Partial<Lore> = {
    itemsFlagged: current.itemsFlagged + Math.floor(Math.random() * 12) + 3,
    sourcesMonitored: Math.random() < 0.1 ? 13 : 14,
    sinclairLocation: pick(SINCLAIR_LOCATIONS),
    sinclairLocationQualifier: pick(SINCLAIR_QUALIFIERS),
    conventionMonth: pick(CONVENTION_MONTHS),
    investigationStart: pick(INVESTIGATION_STARTS),
    boardMembers: boardState.count,
    boardMemberNote: boardState.note,
    compositeRoom: Math.random() < 0.08 ? 'room 204' : null,
    sinclairCurrentTopic: pick(SINCLAIR_TOPICS),
    sinclairLastContact: pick(SINCLAIR_LAST_CONTACTS),
    sinclairNoteCount: current.sinclairNoteCount + Math.floor(Math.random() * 4) + 1,
    sinclairSubmissionSeed: Math.floor(Math.random() * 10000),
  }

  await redis.set(KEY, { ...current, ...updated })
}

const DECAY = 0.3

function decayedClicks(story: Story): number {
  if (!(story.clicks ?? 0)) return 0
  const daysSince = story.clickedAt
    ? (Date.now() - story.clickedAt) / 86400000
    : (Date.now() - new Date(story.ingestedAt).getTime()) / 86400000
  return (story.clicks ?? 0) * Math.exp(-daysSince * DECAY)
}

export async function learnFromEngagement(allStories: Story[]): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  const srcClicks: Record<string, number> = {}
  const srcCounts: Record<string, number> = {}
  const sigClicks: Record<string, number> = {}
  const sigCounts: Record<string, number> = {}

  for (const story of allStories) {
    const w = decayedClicks(story)
    const src = story.source
    srcCounts[src] = (srcCounts[src] ?? 0) + 1
    srcClicks[src] = (srcClicks[src] ?? 0) + w

    for (const sig of story.signals ?? []) {
      sigCounts[sig] = (sigCounts[sig] ?? 0) + 1
      sigClicks[sig] = (sigClicks[sig] ?? 0) + w
    }
  }

  const sourceClickRates: Record<string, number> = {}
  for (const src of Object.keys(srcCounts)) {
    sourceClickRates[src] = srcCounts[src] > 0 ? (srcClicks[src] ?? 0) / srcCounts[src] : 0
  }

  const avgSigRate = Object.values(sigClicks).reduce((a, b) => a + b, 0) /
    Math.max(Object.values(sigCounts).reduce((a, b) => a + b, 0), 1)
  const signalClickRates: Record<string, number> = {}
  for (const sig of Object.keys(sigCounts)) {
    const rate = sigCounts[sig] > 2 ? (sigClicks[sig] ?? 0) / sigCounts[sig] : 0
    signalClickRates[sig] = Math.min(Math.max(rate - avgSigRate, 0), 2)
  }

  const current = await getLore()
  await redis.set(KEY, { ...current, sourceClickRates, signalClickRates })
}

export async function updateDynamicSignals(signals: string[]): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const current = await getLore()
  await redis.set(KEY, { ...current, dynamicSignals: signals })
}
