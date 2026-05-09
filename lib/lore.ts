import { Redis } from '@upstash/redis'
import type { Story } from './types'
import { FEEDS } from './score'

const KEY = 'bid:lore'

export interface Lore {
  sourceClickRates: Record<string, number>
  signalClickRates: Record<string, number>
  dynamicSignals: string[]
  sourcesMonitored: number
  storiesIndexed: number
}

const DEFAULTS: Lore = {
  sourceClickRates: {},
  signalClickRates: {},
  dynamicSignals: [],
  sourcesMonitored: FEEDS.length,
  storiesIndexed: 0,
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

export async function mutateLore(totalStories?: number): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const current = await getLore()
  await redis.set(KEY, {
    ...current,
    sourcesMonitored: FEEDS.length,
    storiesIndexed: totalStories ?? current.storiesIndexed,
  })
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
