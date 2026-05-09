import Anthropic from '@anthropic-ai/sdk'
import Parser from 'rss-parser'
import crypto from 'crypto'
import { stories } from './store'
import { mutateLore, getLore, learnFromEngagement, updateDynamicSignals } from './lore'
import type { Story } from './types'
import {
  FEEDS, PER_FEED, MAX_STORIES,
  analyzeStory, isSameStory, SOURCE_TOPICONLY,
} from './score'

export { analyzeStory, SOURCE_TOPICONLY }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type RSSItem = {
  title?: string
  link?: string
  pubDate?: string
  isoDate?: string
  content?: string
  'content:encoded'?: string
  enclosure?: { url?: string; type?: string }
  mediaContent?: { $?: { url?: string }; url?: string } | Array<{ $?: { url?: string }; url?: string }>
  mediaThumbnail?: { $?: { url?: string }; url?: string } | Array<{ $?: { url?: string }; url?: string }>
  [key: string]: unknown
}

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 8000,
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
})

function extractGoogleSource(title: string, fallback: string): { cleanTitle: string; source: string } {
  const m = title.match(/^(.*\S)\s+-\s+([^-]{3,60})$/)
  if (m) return { cleanTitle: m[1].trim(), source: m[2].trim() }
  return { cleanTitle: title, source: fallback }
}

function extractRSSImage(item: RSSItem): string | undefined {
  // media:content — rss-parser may return attributes under $ or directly on the object
  if (item.mediaContent) {
    const mc = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent
    const url = mc?.$?.url ?? mc?.url
    if (url?.startsWith('http')) return url
  }
  // media:thumbnail
  if (item.mediaThumbnail) {
    const mt = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail
    const url = mt?.$?.url ?? mt?.url
    if (url?.startsWith('http')) return url
  }
  // enclosure (image type)
  if (item.enclosure?.url?.startsWith('http') && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url
  }
  // content:encoded / content — first <img src> in HTML body
  const html = item['content:encoded'] ?? item.content
  if (html) {
    const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
    if (m?.[1]?.startsWith('http')) return m[1].replace(/&amp;/g, '&')
  }
  return undefined
}

// Google News article URLs encode the real URL as a protobuf in the base64url path.
// Scan for the literal ASCII bytes of "http" to extract it without any HTTP request.
function decodeGoogleNewsUrl(gnUrl: string): string {
  try {
    const m = gnUrl.match(/articles\/([A-Za-z0-9_-]+)/)
    if (!m) return gnUrl
    const buf = Buffer.from(m[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    for (let i = 0; i < buf.length - 4; i++) {
      if (buf[i] === 0x68 && buf[i+1] === 0x74 && buf[i+2] === 0x74 && buf[i+3] === 0x70) {
        let end = i
        while (end < buf.length && buf[end] >= 0x21 && buf[end] <= 0x7e) end++
        const url = buf.slice(i, end).toString('ascii')
        if (url.startsWith('https://') || url.startsWith('http://')) return url
      }
    }
    return gnUrl
  } catch { return gnUrl }
}

export async function ingestFeeds(): Promise<number> {
  const [existing, lore] = await Promise.all([stories.values(), getLore()])

  // Rescore all stored stories
  await Promise.all(existing.map(async story => {
    const title = story.originalHeadline || story.headline
    const scores = analyzeStory(title)
    if (scores.score < 0) {
      await stories.delete(story.id)
      return
    }
    if (scores.score !== (story.score ?? 1)) {
      await stories.set(story.id, {
        ...story,
        score: scores.score,
        fashionScore: scores.fashionScore,
        rushScore: scores.rushScore,
        hazingScore: scores.hazingScore,
        viralScore: scores.viralScore,
        signals: scores.signals,
      })
    }
  }))

  const allRescored = await stories.values()
  allRescored.sort((a, b) => (b.score ?? 1) - (a.score ?? 1))
  const existingEntityCount = new Map<string, number>()
  await Promise.all(allRescored.map(async s => {
    const entities = (s.signals ?? []).filter(sig => sig.startsWith('entity:')).map(sig => sig.slice(7))
    if (entities.length === 0) return
    if (entities.some(e => (existingEntityCount.get(e) ?? 0) >= 2)) {
      await stories.delete(s.id)
      return
    }
    entities.forEach(e => existingEntityCount.set(e, (existingEntityCount.get(e) ?? 0) + 1))
  }))

  const rescored = await stories.values()

  // Fix existing stories: resolve Google redirect URLs and replace bad Google-hosted images
  const googleHostRe = /google|gstatic|googleapis|ggpht/
  // Fix existing stories: decode Google redirect URLs, replace bad Google-hosted images
  await Promise.allSettled(
    rescored
      .filter(s => s.sourceUrl.includes('news.google.com') || googleHostRe.test(s.imageUrl ?? ''))
      .slice(0, 25)
      .map(async s => {
        try {
          // Try protobuf decode first (no HTTP needed)
          if (s.sourceUrl.includes('news.google.com')) {
            const decoded = decodeGoogleNewsUrl(s.sourceUrl)
            if (decoded !== s.sourceUrl) s.sourceUrl = decoded
          }
          if (s.sourceUrl.includes('news.google.com')) return  // still unresolved — skip image
          if (!googleHostRe.test(s.imageUrl ?? '')) { await stories.set(s.id, s); return }
          // Fetch og:image to replace bad Google-hosted image
          const res = await fetch(s.sourceUrl, {
            signal: AbortSignal.timeout(6000),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BidSheetBot/1.0; +https://thebidsheet.com)' },
            redirect: 'follow',
          })
          if (!res.ok) return
          const html = await res.text()
          const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
            ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
          s.imageUrl = m?.[1] ? (m[1].startsWith('http') ? m[1] : new URL(m[1], res.url).href) : undefined
          await stories.set(s.id, s)
        } catch { /* non-fatal */ }
      })
  )

  const seen = new Set(rescored.map(s => s.sourceUrl))

  const rates = Object.values(lore.sourceClickRates)
  const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0

  const shuffled = [...FEEDS].sort(() => Math.random() - 0.5)
  const fresh: Story[] = []

  const fetchPromises = shuffled.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url)
      const isGoogleFeed = feed.url.includes('news.google.com')
      const candidates: Story[] = []
      for (const item of parsed.items || []) {
        if (!item.title || !item.link) continue
        const resolvedLink = isGoogleFeed ? decodeGoogleNewsUrl(item.link) : item.link
        if (seen.has(resolvedLink)) continue
        const { cleanTitle, source: displaySource } = isGoogleFeed
          ? extractGoogleSource(item.title, feed.source)
          : { cleanTitle: item.title, source: feed.source }
        // Google feeds: even though topicOnly skips the full hasTopic check,
        // still require at least one Greek-life keyword to filter irrelevant results
        if (isGoogleFeed) {
          const lt = cleanTitle.toLowerCase()
          const hasGreek = ['sorority','fraternity','greek life','panhellenic','hazing',
            'pledge','chapter','sigma','kappa','alpha','theta','zeta','gamma','phi mu',
            'delta','rush week','bid day'].some(t => lt.includes(t))
          if (!hasGreek) continue
        }
        // topicOnly feeds are pre-filtered — skip the sorority-term topic check
        const scores = analyzeStory(cleanTitle, feed.topicOnly)
        if (scores.score < 0) continue
        const threshold = feed.minScore ?? (feed.topicOnly ? 1 : 3)
        if (scores.score < threshold) continue
        const sourceRate = lore.sourceClickRates[feed.source] ?? 0
        const sourceBoost = avgRate > 0 && sourceRate > avgRate * 1.5 ? 2 : 0
        const signalBoost = scores.signals.reduce((sum, sig) => sum + (lore.signalClickRates?.[sig] ?? 0), 0)
        const lowerTitle = cleanTitle.toLowerCase()
        const dynamicBoost = (lore.dynamicSignals ?? []).some(s => lowerTitle.includes(s.toLowerCase())) ? 2 : 0
        const rssImage = extractRSSImage(item)
        const cleanRSSImage = rssImage && !googleHostRe.test(rssImage) ? rssImage : undefined
        const imageBoost = cleanRSSImage ? 1 : 0
        const boost = sourceBoost + Math.min(signalBoost, 3) + dynamicBoost + imageBoost
        candidates.push({
          id: crypto.randomBytes(6).toString('hex'),
          headline: cleanTitle,
          originalHeadline: item.title,
          adequateVoice: '',
          source: displaySource,
          sourceUrl: resolvedLink,
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
          score: scores.score + boost,
          fashionScore: scores.fashionScore + (scores.fashionScore > 0 ? boost : 0),
          rushScore: scores.rushScore + (scores.rushScore > 0 ? boost : 0),
          hazingScore: scores.hazingScore + (scores.hazingScore > 0 ? boost : 0),
          viralScore: scores.viralScore + (scores.viralScore > 0 ? boost : 0),
          signals: scores.signals,
          ...(cleanRSSImage ? { imageUrl: cleanRSSImage } : {}),
        })
        seen.add(resolvedLink)
      }
      candidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      return candidates.slice(0, feed.perFeed ?? PER_FEED)
    } catch { return [] }
  })

  const results = await Promise.allSettled(fetchPromises)
  for (const r of results) {
    if (r.status === 'fulfilled') fresh.push(...r.value)
  }

  fresh.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  // Dedup: max 1 story per entity+tier1 combo
  const eventSeen = new Map<string, number>()
  const dedupedFresh = fresh.filter(s => {
    const tier1 = s.signals?.find(sig => sig.startsWith('tier1:'))
    if (!tier1) return true
    const entity = s.signals?.find(sig => sig.startsWith('entity:')) || 'none'
    const key = `${entity}|${tier1}`
    const count = eventSeen.get(key) ?? 0
    if (count >= 1) return false
    eventSeen.set(key, count + 1)
    return true
  })
  fresh.length = 0
  fresh.push(...dedupedFresh)

  // Cross-source dedup
  const crossDeduped: Story[] = []
  for (const s of fresh) {
    const isDup = crossDeduped.some(ex =>
      isSameStory(s.headline, s.signals ?? [], ex.headline, ex.signals ?? [])
    )
    if (!isDup) crossDeduped.push(s)
  }
  fresh.length = 0
  fresh.push(...crossDeduped)

  // Entity cap: max 2 stories per named entity
  const entityCount = new Map<string, number>()
  const entityCapped: Story[] = []
  for (const s of fresh) {
    const entities = (s.signals ?? []).filter(sig => sig.startsWith('entity:')).map(sig => sig.slice(7))
    if (entities.length === 0) { entityCapped.push(s); continue }
    if (entities.some(e => (entityCount.get(e) ?? 0) >= 2)) continue
    entities.forEach(e => entityCount.set(e, (entityCount.get(e) ?? 0) + 1))
    entityCapped.push(s)
  }
  fresh.length = 0
  fresh.push(...entityCapped)
  fresh.splice(MAX_STORIES)

  // Evict lowest-score-then-oldest
  const toEvict = rescored.length + fresh.length - MAX_STORIES
  if (toEvict > 0) {
    const evictCandidates = rescored.sort((a, b) => {
      const scoreDiff = (a.score ?? 1) - (b.score ?? 1)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(a.ingestedAt).getTime() - new Date(b.ingestedAt).getTime()
    })
    await Promise.all(evictCandidates.slice(0, toEvict).map(s => stories.delete(s.id)))
  }

  // Step 1: Resolve Google News URLs via protobuf decode (no HTTP needed)
  for (const s of fresh) {
    if (s.sourceUrl.includes('news.google.com')) {
      const decoded = decodeGoogleNewsUrl(s.sourceUrl)
      if (decoded !== s.sourceUrl) s.sourceUrl = decoded
    }
  }

  const browserUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

  // Step 2: Fetch og:image for stories that need one
  await Promise.allSettled(
    fresh
      .filter(s =>
        (!s.imageUrl || googleHostRe.test(s.imageUrl)) &&
        (s.score ?? 0) >= 1 &&
        !s.sourceUrl.includes('news.google.com')  // skip any still-unresolved Google URLs
      )
      .slice(0, 100)
      .map(async s => {
        try {
          const res = await fetch(s.sourceUrl, {
            signal: AbortSignal.timeout(8000),
            headers: {
              'User-Agent': browserUA,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
            },
            redirect: 'follow',
          })
          if (!res.ok) return
          const html = await res.text()
          const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
            ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
            ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
          if (m?.[1]) {
            const url = m[1].startsWith('http') ? m[1] : new URL(m[1], res.url).href
            if (!googleHostRe.test(url)) s.imageUrl = url  // reject Google-hosted results
          }
        } catch { /* non-fatal */ }
      })
  )

  await Promise.all(fresh.map(s => stories.set(s.id, s)))

  // Generate Elle Woods voice for fresh stories (batched)
  const VOICE_SYSTEM = 'You are the editorial voice of The Bid Sheet — the most plugged-in girl in Greek life. You cover sorority rush, bid day, fashion, chapter drama, and campus life at SEC and Big Ten schools. Your takes are confident, warm, insider, and a little obsessive. You sound like Elle Woods if she ran a sorority news vertical. Write 2-3 sentence takes that give real context and personality — not just a quip. Think: what would your most informed friend text you about this? Light, fun, knowing, never preachy or formal.'
  const VOICE_PROMPT = (headlines: string) => `For each headline, write 2-3 sentences of insider commentary with real context and sorority energy. Be specific and fun. Return ONLY valid JSON: {"takes": ["take 1", "take 2", ...]}\n\n${headlines}`

  async function generateVoice(batch: Story[]): Promise<void> {
    if (!batch.length) return
    try {
      const headlines = batch.map((s, i) => `${i + 1}. ${s.headline}`).join('\n')
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system: VOICE_SYSTEM,
        messages: [{ role: 'user', content: VOICE_PROMPT(headlines) }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
      const result = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      if (Array.isArray(result.takes)) {
        result.takes.forEach((take: string, i: number) => {
          if (batch[i] && take) batch[i].adequateVoice = String(take).slice(0, 400)
        })
        await Promise.all(batch.filter(s => s.adequateVoice).map(s => stories.set(s.id, s)))
      }
    } catch { /* non-fatal */ }
  }

  const needVoiceFresh = fresh.filter(s => !s.adequateVoice && s.headline).slice(0, 60)
  await generateVoice(needVoiceFresh)

  // Also backfill voice on existing stored stories that were ingested before voice was added
  const allStoredNow = await stories.values()
  const needVoiceExisting = allStoredNow
    .filter(s => !s.adequateVoice && s.headline && !fresh.some(f => f.id === s.id))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 50)
  await generateVoice(needVoiceExisting)

  const allStories = allStoredNow

  // Extract trending signals from top stories
  const topForReview = [...allStories].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10)
  if (topForReview.length >= 3) {
    try {
      const headlines = topForReview.map(s => s.headline || s.originalHeadline).join('\n')
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Greek life / sorority headlines:\n${headlines}\n\nExtract 6-10 short phrases (2-4 words, lowercase) that capture trending topics or patterns. Return ONLY valid JSON: {"signals": ["phrase one", ...]}`,
        }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
      const result = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      if (Array.isArray(result.signals) && result.signals.length > 0) {
        await updateDynamicSignals(result.signals.map((s: string) => String(s).toLowerCase().slice(0, 50)))
      }
    } catch { /* non-fatal */ }
  }

  await learnFromEngagement(allStories)
  await mutateLore(allStories.length)

  return fresh.length
}
