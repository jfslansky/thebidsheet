/**
 * Industrialized feed prober — generates and tests RSS candidates for all schools
 *
 * Usage:
 *   npx tsx scripts/probe/run.ts                  — probe all new candidates
 *   npx tsx scripts/probe/run.ts --fresh           — ignore cache, re-probe everything
 *   npx tsx scripts/probe/run.ts --conf=SEC        — only probe schools in a conference
 *   npx tsx scripts/probe/run.ts --school=Alabama  — probe one school by short name
 *   npx tsx scripts/probe/run.ts --export          — print copy-ready FEEDS[] from live results
 *   npx tsx scripts/probe/run.ts --summary         — print summary of cached results
 */

import Parser from 'rss-parser'
import * as fs from 'fs'
import * as path from 'path'
import { SCHOOLS, type School } from './schools'

const parser = new Parser({ timeout: 8000 })
const RESULTS_FILE = path.join(__dirname, 'results.json')
const CONCURRENCY = 40

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const FRESH = args.includes('--fresh')
const EXPORT_ONLY = args.includes('--export')
const SUMMARY_ONLY = args.includes('--summary')
const CONF_FILTER = args.find(a => a.startsWith('--conf='))?.split('=')[1]
const SCHOOL_FILTER = args.find(a => a.startsWith('--school='))?.split('=')[1]

// ── Results cache ─────────────────────────────────────────────────────────────
type ProbeResult = {
  status: 'ok' | 'dead' | 'timeout'
  items: number
  sample: string[]
  school?: string
  category: string
  probedAt: string
}

type ResultsCache = Record<string, ProbeResult>

function loadCache(): ResultsCache {
  if (FRESH || !fs.existsSync(RESULTS_FILE)) return {}
  try { return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8')) }
  catch { return {} }
}

function saveCache(cache: ResultsCache) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(cache, null, 2))
}

// ── URL patterns ──────────────────────────────────────────────────────────────
const PAPER_PATTERNS = [
  '/feed/', '/feed', '/rss/', '/rss', '/rss.xml', '/atom.xml',
  '/feed/rss/', '/feed/rss2/', '/news/feed/', '/campus/feed/',
  '/tag/sorority/feed/', '/tag/greek-life/feed/', '/tag/hazing/feed/',
  '/tag/fraternity/feed/', '/tag/rush/feed/', '/tag/panhellenic/feed/',
  '/category/news/feed/', '/category/campus/feed/', '/section/campus.xml',
  '/recent/article.xml',
]

function googleNews(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
}

type Candidate = { url: string; school: string; category: string }

function generateCandidates(school: School): Candidate[] {
  const candidates: Candidate[] = []
  const name = school.short

  // Paper RSS patterns
  if (school.paperDomain) {
    const base = `https://${school.paperDomain}`
    for (const pattern of PAPER_PATTERNS) {
      candidates.push({ url: `${base}${pattern}`, school: name, category: 'Paper' })
    }
  }

  // Her Campus chapter
  if (school.herSlug) {
    candidates.push({
      url: `https://www.hercampus.com/school/${school.herSlug}/feed/`,
      school: name,
      category: 'Her Campus',
    })
    // Also try tag-specific
    candidates.push({
      url: `https://www.hercampus.com/school/${school.herSlug}/tag/sorority/feed/`,
      school: name,
      category: 'Her Campus',
    })
  }

  // Google News — always live, always worth adding
  candidates.push({
    url: googleNews(`sorority "${school.short}"`),
    school: name,
    category: 'Google News',
  })
  candidates.push({
    url: googleNews(`"greek life" "${school.short}"`),
    school: name,
    category: 'Google News',
  })
  candidates.push({
    url: googleNews(`hazing "${school.short}"`),
    school: name,
    category: 'Google News',
  })

  // Local news domain
  if (school.localDomain) {
    const base = `https://www.${school.localDomain}`
    for (const pattern of ['/feed/', '/rss/', '/arcio/rss/', '/arc/outboundfeeds/rss/']) {
      candidates.push({ url: `${base}${pattern}`, school: name, category: 'Local' })
    }
  }

  return candidates
}

// ── Probe ─────────────────────────────────────────────────────────────────────
async function probe(url: string): Promise<{ status: ProbeResult['status']; items: number; sample: string[] }> {
  try {
    const feed = await parser.parseURL(url)
    const items = feed.items ?? []
    const sample = items.slice(0, 3).map(i => i.title ?? '').filter(Boolean)
    return { status: 'ok', items: items.length, sample }
  } catch (e: unknown) {
    const msg = String(e)
    const dead = ['404', '403', '410', 'ENOTFOUND', 'ECONNREFUSED', 'ENOENT', '301', 'gone'].some(s => msg.includes(s))
    return { status: dead ? 'dead' : 'timeout', items: 0, sample: [] }
  }
}

async function runBatch(batch: Candidate[], cache: ResultsCache): Promise<number> {
  const uncached = batch.filter(c => !cache[c.url])
  if (uncached.length === 0) return 0

  const results = await Promise.all(
    uncached.map(async (c) => {
      const r = await probe(c.url)
      return { ...c, ...r }
    })
  )

  for (const r of results) {
    cache[r.url] = {
      status: r.status,
      items: r.items,
      sample: r.sample,
      school: r.school,
      category: r.category,
      probedAt: new Date().toISOString(),
    }
  }

  return uncached.length
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const cache = loadCache()

  if (SUMMARY_ONLY) {
    printSummary(cache)
    return
  }

  if (EXPORT_ONLY) {
    printExport(cache)
    return
  }

  // Filter schools
  let schools = SCHOOLS
  if (CONF_FILTER) schools = schools.filter(s => s.conf.toLowerCase() === CONF_FILTER.toLowerCase())
  if (SCHOOL_FILTER) schools = schools.filter(s => s.short.toLowerCase().includes(SCHOOL_FILTER.toLowerCase()))

  // Generate all candidates
  const all: Candidate[] = []
  for (const school of schools) {
    all.push(...generateCandidates(school))
  }

  const uncached = all.filter(c => !cache[c.url])
  const skipped = all.length - uncached.length

  console.log(`\n📡 ${schools.length} schools → ${all.length} candidates`)
  console.log(`   ${skipped} already cached, probing ${uncached.length} new...\n`)

  if (uncached.length === 0) {
    console.log('Nothing new to probe. Run with --fresh to re-test all.\n')
    printSummary(cache)
    return
  }

  // Probe in batches
  let done = 0
  for (let i = 0; i < uncached.length; i += CONCURRENCY) {
    const batch = uncached.slice(i, i + CONCURRENCY)
    await runBatch(batch, cache)
    done += batch.length
    process.stdout.write(`\r   ${done}/${uncached.length} probed...`)
  }

  saveCache(cache)
  console.log('\n')
  printSummary(cache)
}

function printSummary(cache: ResultsCache) {
  const entries = Object.entries(cache)
  const live = entries.filter(([, v]) => v.status === 'ok' && v.items > 0)
  const empty = entries.filter(([, v]) => v.status === 'ok' && v.items === 0)
  const dead = entries.filter(([, v]) => v.status === 'dead')
  const timeout = entries.filter(([, v]) => v.status === 'timeout')

  console.log(`\x1b[1m=== PROBE RESULTS (${entries.length} total) ===\x1b[0m`)
  console.log(`  \x1b[32mLive with items: ${live.length}\x1b[0m`)
  console.log(`  \x1b[33mLive but empty:  ${empty.length}\x1b[0m`)
  console.log(`  \x1b[31mDead:            ${dead.length}\x1b[0m`)
  console.log(`  \x1b[2mTimeout:         ${timeout.length}\x1b[0m\n`)

  // Group live by school
  const bySchool = new Map<string, { url: string; category: string; items: number; sample: string[] }[]>()
  for (const [url, v] of live) {
    const key = v.school ?? 'General'
    if (!bySchool.has(key)) bySchool.set(key, [])
    bySchool.get(key)!.push({ url, category: v.category, items: v.items, sample: v.sample })
  }

  console.log(`\x1b[1m=== LIVE FEEDS BY SCHOOL ===\x1b[0m\n`)
  for (const [school, feeds] of [...bySchool].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\x1b[1m${school}\x1b[0m`)
    for (const f of feeds) {
      console.log(`  \x1b[32m✓\x1b[0m [${f.category}] ${f.url}  (${f.items} items)`)
      if (f.sample[0]) console.log(`      \x1b[2m"${f.sample[0]}"\x1b[0m`)
    }
    console.log()
  }

  console.log(`Run with \x1b[1m--export\x1b[0m to get copy-ready FEEDS[] entries.\n`)
}

function printExport(cache: ResultsCache) {
  const live = Object.entries(cache)
    .filter(([, v]) => v.status === 'ok' && v.items > 0)
    .sort(([, a], [, b]) => (b.items - a.items))

  console.log(`\n// === GENERATED FEEDS — ${new Date().toLocaleDateString()} ===\n`)

  let lastSchool = ''
  for (const [url, v] of live) {
    const school = v.school ?? 'General'
    if (school !== lastSchool) {
      console.log(`\n  // ── ${school} ──`)
      lastSchool = school
    }
    const topicOnly = v.category === 'Google News' ? 'true' : 'false'
    const minScore = v.category === 'Paper' || v.category === 'Local' ? 1 : 1
    console.log(`  { url: '${url}', source: '${school} (${v.category})', topicOnly: ${topicOnly}, minScore: ${minScore} },`)
  }
  console.log()
}

main().catch(console.error)
