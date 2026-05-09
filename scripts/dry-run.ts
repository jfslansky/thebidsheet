/**
 * dry-run.ts — fetch all feeds, score, categorize, show image stats + category breakdown
 * Usage: npx tsx scripts/dry-run.ts [--verbose] [--category=fashion|rush|drama|accountability]
 */
import Parser from 'rss-parser'
import {
  FEEDS, analyzeStory,
  FASHION_SIGNALS, RUSH_SIGNALS, VIRAL_SIGNALS,
  LIFESTYLE_SOURCES, FASHION_SOURCES, ACCOUNTABILITY_SOURCES,
} from '../lib/score'

const VERBOSE = process.argv.includes('--verbose')
const FILTER_CAT = process.argv.find(a => a.startsWith('--category='))?.split('=')[1]

type RSSItem = {
  title?: string
  link?: string
  pubDate?: string
  content?: string
  'content:encoded'?: string
  enclosure?: { url?: string; type?: string }
  mediaContent?: { $?: { url?: string }; url?: string } | Array<{ $?: { url?: string }; url?: string }>
  mediaThumbnail?: { $?: { url?: string }; url?: string } | Array<{ $?: { url?: string }; url?: string }>
  [key: string]: unknown
}

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 10000,
  customFields: {
    item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']],
  },
})

function extractImage(item: RSSItem): string | undefined {
  if (item.mediaContent) {
    const mc = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent
    const url = mc?.$?.url ?? mc?.url
    if (url?.startsWith('http')) return url
  }
  if (item.mediaThumbnail) {
    const mt = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail
    const url = mt?.$?.url ?? mt?.url
    if (url?.startsWith('http')) return url
  }
  if (item.enclosure?.url?.startsWith('http') && item.enclosure.type?.startsWith('image')) return item.enclosure.url
  const html = item['content:encoded'] ?? item.content
  if (html) {
    const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
    if (m?.[1]?.startsWith('http')) return m[1].replace(/&amp;/g, '&')
  }
  return undefined
}

// --- Category classification (uses shared signals from score.ts) ------------

const ACCOUNTABILITY_KEYWORDS = [
  'hazing', 'died', 'death', 'killed', 'murder', 'suicide',
  'charter revoked', 'chapter deactivated', 'removed from campus',
]

const DRAMA_KEYWORDS = [
  'suspended', 'expelled', 'investigation', 'lawsuit', 'arrested', 'charged',
  'banned', 'revoked', 'violated', 'probation', 'backlash', 'under fire',
  'controversy', 'controversial', 'protest', 'walkout', 'resignation',
  'racist', 'discrimination', 'abuse', 'assault', 'scandal',
]

const LIGHT_KEYWORDS = [
  'sisterhood', 'philanthropy', 'chapter news', 'new member', 'pledge class',
  'greek week', 'homecoming', 'sorority life', 'big little',
  'my sorority', 'joining a sorority', 'joined a sorority',
  'shaped the person', 'best decision', 'sorority girl',
  'why i joined', 'sorority experience', 'sorority member',
  'service sorority', 'sorority stereotype', 'sorority chapter',
  'sorority pride', 'sorority advice', 'sorority tradition',
]

type Category = 'accountability' | 'drama' | 'fashion' | 'rush' | 'viral' | 'light' | 'uncategorized'

function categorize(headline: string, signals: string[], source: string): Category {
  const lower = headline.toLowerCase()
  const hasAccountabilitySig = signals.some(s =>
    s.includes('hazing') || s.startsWith('tier1:') || s.startsWith('rush:')
  )
  if (ACCOUNTABILITY_SOURCES.has(source)) return 'accountability'
  if (hasAccountabilitySig || ACCOUNTABILITY_KEYWORDS.some(k => lower.includes(k))) return 'accountability'
  if (DRAMA_KEYWORDS.some(k => lower.includes(k))) return 'drama'
  if (FASHION_SOURCES.has(source)) return 'fashion'
  if (FASHION_SIGNALS.some(k => lower.includes(k))) return 'fashion'
  if (RUSH_SIGNALS.some(k => lower.includes(k))) return 'rush'
  if (VIRAL_SIGNALS.some(k => lower.includes(k))) return 'viral'
  if (LIGHT_KEYWORDS.some(k => lower.includes(k))) return 'light'
  if (LIFESTYLE_SOURCES.has(source)) return 'light'
  return 'uncategorized'
}

// --- Stats tracking ---

type FeedResult = {
  source: string
  url: string
  total: number
  passed: number       // score >= minScore
  withImage: number
  byCategory: Record<Category, number>
  stories: StoryResult[]
  error?: string
}

type StoryResult = {
  headline: string
  score: number
  signals: string[]
  hasImage: boolean
  category: Category
  link: string
}

async function testFeed(feed: (typeof FEEDS)[number]): Promise<FeedResult> {
  const result: FeedResult = {
    source: feed.source,
    url: feed.url,
    total: 0,
    passed: 0,
    withImage: 0,
    byCategory: { accountability: 0, drama: 0, fashion: 0, rush: 0, viral: 0, light: 0, uncategorized: 0 },
    stories: [],
  }

  try {
    const feedData = await parser.parseURL(feed.url)
    const items = (feedData.items || []).slice(0, feed.perFeed ?? 10)
    result.total = items.length

    for (const item of items) {
      const raw = item.title ?? ''
      const text = raw + ' ' + (item['content:encoded'] ?? item.content ?? '').slice(0, 500)
      const scores = analyzeStory(text, feed.topicOnly)

      const minScore = feed.minScore ?? 1
      if (scores.score < minScore) continue

      const image = extractImage(item)
      const category = categorize(raw, scores.signals, feed.source)
      result.passed++
      if (image) result.withImage++
      result.byCategory[category]++

      result.stories.push({
        headline: raw.slice(0, 90),
        score: scores.score,
        signals: scores.signals,
        hasImage: !!image,
        category,
        link: (item.link ?? '').slice(0, 80),
      })
    }
  } catch (e: unknown) {
    result.error = String(e).slice(0, 120)
  }

  return result
}

async function main() {
  console.log(`\n${'='.repeat(72)}`)
  console.log('  BID REPORT DRY RUN — ' + new Date().toLocaleString())
  console.log(`${'='.repeat(72)}\n`)

  const results = await Promise.allSettled(FEEDS.map(f => testFeed(f)))

  // Deduplicate by source for summary
  const bySource: Record<string, FeedResult[]> = {}
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const res = r.value;
      (bySource[res.source] ??= []).push(res)
    }
  }

  const allStories: (StoryResult & { source: string })[] = []
  const totals = { total: 0, passed: 0, withImage: 0, byCategory: {} as Record<Category, number> }
  const CATS: Category[] = ['accountability', 'drama', 'fashion', 'rush', 'viral', 'light', 'uncategorized']
  CATS.forEach(c => (totals.byCategory[c] = 0))

  // Per-feed summary
  console.log('FEED RESULTS\n')
  for (const [source, feedResults] of Object.entries(bySource)) {
    const total = feedResults.reduce((s, f) => s + f.total, 0)
    const passed = feedResults.reduce((s, f) => s + f.passed, 0)
    const withImage = feedResults.reduce((s, f) => s + f.withImage, 0)
    const errors = feedResults.filter(f => f.error).map(f => f.error)
    const catCounts = CATS.map(c => {
      const n = feedResults.reduce((s, f) => s + f.byCategory[c], 0)
      return n > 0 ? `${c}:${n}` : null
    }).filter(Boolean).join(' ')

    const imgPct = passed > 0 ? Math.round((withImage / passed) * 100) : 0
    const status = errors.length > 0 ? ` ❌ ${errors[0]}` : ''
    console.log(`  ${source.padEnd(28)} ${passed}/${total} passed  ${withImage} imgs (${imgPct}%)  [${catCounts}]${status}`)

    totals.total += total
    totals.passed += passed
    totals.withImage += withImage
    for (const cat of CATS) {
      totals.byCategory[cat] += feedResults.reduce((s, f) => s + f.byCategory[cat], 0)
    }

    for (const f of feedResults) {
      for (const s of f.stories) allStories.push({ ...s, source })
    }
  }

  // Totals
  const imgPct = totals.passed > 0 ? Math.round((totals.withImage / totals.passed) * 100) : 0
  const catSummary = CATS.map(c => `${c}:${totals.byCategory[c]}`).join('  ')
  console.log(`\n  ${'TOTAL'.padEnd(28)} ${totals.passed}/${totals.total} passed  ${totals.withImage} imgs (${imgPct}%)`)
  console.log(`  ${catSummary}\n`)

  // Category breakdown
  const showCats = FILTER_CAT ? [FILTER_CAT as Category] : CATS.filter(c => c !== 'uncategorized')

  for (const cat of showCats) {
    const stories = allStories
      .filter(s => s.category === cat)
      .sort((a, b) => b.score - a.score)
      .slice(0, VERBOSE ? 20 : 8)

    if (stories.length === 0) continue
    console.log(`\n--- ${cat.toUpperCase()} (${allStories.filter(s => s.category === cat).length} total) ---`)
    for (const s of stories) {
      const img = s.hasImage ? '📷' : '  '
      const sig = s.signals.slice(0, 2).join(', ')
      console.log(`  ${img} [${s.score}] ${s.headline}`)
      if (VERBOSE && sig) console.log(`       signals: ${sig}`)
      if (VERBOSE) console.log(`       source: ${s.source}`)
    }
  }

  // Image-less sources that should have images
  console.log('\n--- IMAGE COVERAGE BY CATEGORY ---')
  for (const cat of CATS) {
    const catStories = allStories.filter(s => s.category === cat)
    if (catStories.length === 0) continue
    const withImg = catStories.filter(s => s.hasImage).length
    const pct = Math.round((withImg / catStories.length) * 100)
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))
    console.log(`  ${cat.padEnd(16)} ${bar} ${withImg}/${catStories.length} (${pct}%)`)
  }

  // Uncategorized sample
  const uncat = allStories.filter(s => s.category === 'uncategorized').slice(0, 10)
  if (uncat.length > 0) {
    console.log(`\n--- UNCATEGORIZED SAMPLE (${allStories.filter(s => s.category === 'uncategorized').length} total — tune these) ---`)
    for (const s of uncat) {
      const img = s.hasImage ? '📷' : '  '
      console.log(`  ${img} [${s.score}] [${s.source}] ${s.headline}`)
    }
  }

  console.log()
}

main().catch(console.error)
