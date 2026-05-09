// Probe new candidate RSS feeds before adding to score.ts
// Usage: npx tsx scripts/probe-candidates.ts

import Parser from 'rss-parser'

const parser = new Parser({ timeout: 8000 })

const CANDIDATES: { url: string; label: string; category: string }[] = [
  // ── REDDIT ───────────────────────────────────────────────────────────────
  { url: 'https://www.reddit.com/r/Sororities/.rss', label: 'r/Sororities', category: 'Reddit' },
  { url: 'https://www.reddit.com/r/GreekLife/.rss', label: 'r/GreekLife', category: 'Reddit' },
  { url: 'https://www.reddit.com/r/Panhellenic/.rss', label: 'r/Panhellenic', category: 'Reddit' },
  { url: 'https://www.reddit.com/r/BamaRush/.rss', label: 'r/BamaRush', category: 'Reddit' },
  { url: 'https://www.reddit.com/r/college/.rss', label: 'r/college', category: 'Reddit' },

  // ── PODCASTS ──────────────────────────────────────────────────────────────
  { url: 'https://feeds.megaphone.fm/madrush', label: 'Mad Rush (Trisha Addicks)', category: 'Podcast' },
  { url: 'https://www.spreaker.com/show/5647908/episodes/feed', label: 'SNAPPED Podcast', category: 'Podcast' },
  { url: 'https://rss.libsyn.com/shows/148277/destinations/949583.xml', label: 'Fraternity Foodie', category: 'Podcast' },

  // ── HER CAMPUS SCHOOL CHAPTERS ────────────────────────────────────────────
  { url: 'https://www.hercampus.com/school/ua/feed/', label: 'Her Campus Alabama', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/ole-miss/feed/', label: 'Her Campus Ole Miss', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/georgia/feed/', label: 'Her Campus Georgia', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/michigan/feed/', label: 'Her Campus Michigan', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/texas/feed/', label: 'Her Campus Texas', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/lsu/feed/', label: 'Her Campus LSU', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/vanderbilt/feed/', label: 'Her Campus Vanderbilt', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/auburn/feed/', label: 'Her Campus Auburn', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/tennessee/feed/', label: 'Her Campus Tennessee', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/ohio-state/feed/', label: 'Her Campus Ohio State', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/northwestern/feed/', label: 'Her Campus Northwestern', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/usc/feed/', label: 'Her Campus USC', category: 'Her Campus' },
  { url: 'https://www.hercampus.com/school/smu/feed/', label: 'Her Campus SMU', category: 'Her Campus' },

  // ── STOPHAZING CATEGORY FEEDS ─────────────────────────────────────────────
  { url: 'https://stophazing.org/category/hazing-news/feed/', label: 'StopHazing - News', category: 'Accountability' },
  { url: 'https://stophazing.org/category/greek-life-hazing/feed/', label: 'StopHazing - Greek', category: 'Accountability' },
  { url: 'https://hazingprevention.org/feed/', label: 'Hazing Prevention Network', category: 'Accountability' },

  // ── LOCAL NEWS ────────────────────────────────────────────────────────────
  { url: 'https://tuscaloosathread.com/feed/', label: 'Tuscaloosa Thread', category: 'Local' },
  { url: 'https://www.al.com/arc/outboundfeeds/rss/', label: 'AL.com', category: 'Local' },
  { url: 'https://www.onlineathens.com/arcio/rss/', label: 'Athens Banner-Herald', category: 'Local' },
  { url: 'https://www.mlive.com/arc/outboundfeeds/rss/?section=/ann-arbor', label: 'MLive Ann Arbor', category: 'Local' },
  { url: 'https://www.clarionledger.com/arcio/rss/', label: 'Clarion Ledger (Ole Miss area)', category: 'Local' },
  { url: 'https://www.knoxnews.com/arcio/rss/', label: 'Knox News (Tennessee)', category: 'Local' },
  { url: 'https://www.nola.com/arc/outboundfeeds/rss/', label: 'NOLA.com (LSU)', category: 'Local' },

  // ── LIFESTYLE & FASHION ───────────────────────────────────────────────────
  { url: 'https://www.seventeen.com/rss/default.xml', label: 'Seventeen', category: 'Lifestyle' },
  { url: 'https://www.bustle.com/feed', label: 'Bustle', category: 'Lifestyle' },
  { url: 'https://www.refinery29.com/feed/rss', label: 'Refinery29', category: 'Lifestyle' },
  { url: 'https://spoonuniversity.com/feed/', label: 'Spoon University', category: 'Lifestyle' },
  { url: 'https://www.theodysseyonline.com/feed/', label: 'The Odyssey Online', category: 'Lifestyle' },
  { url: 'https://collegemagazine.com/feed/', label: 'College Magazine', category: 'Lifestyle' },
  { url: 'https://www.cosmopolitan.com/rss/all.xml/', label: 'Cosmopolitan', category: 'Lifestyle' },
  { url: 'https://www.elle.com/rss/all.xml/', label: 'ELLE', category: 'Lifestyle' },

  // ── NATIONAL SORORITY ORGS ────────────────────────────────────────────────
  { url: 'https://www.chiomega.com/feed/', label: 'Chi Omega', category: 'Sorority Org' },
  { url: 'https://www.alphachiomega.org/feed/', label: 'Alpha Chi Omega', category: 'Sorority Org' },
  { url: 'https://www.tridelta.org/feed/', label: 'Tri Delta', category: 'Sorority Org' },
  { url: 'https://www.pibetaphi.org/feed/', label: 'Pi Beta Phi', category: 'Sorority Org' },
  { url: 'https://www.gammaphibeta.org/feed/', label: 'Gamma Phi Beta', category: 'Sorority Org' },
  { url: 'https://www.kappakappagamma.org/feed/', label: 'Kappa Kappa Gamma', category: 'Sorority Org' },
  { url: 'https://www.alphaphi.org/feed/', label: 'Alpha Phi', category: 'Sorority Org' },
  { url: 'https://www.zetataualpha.org/feed/', label: 'Zeta Tau Alpha', category: 'Sorority Org' },
  { url: 'https://www.kappaalphatheta.org/feed/', label: 'Kappa Alpha Theta', category: 'Sorority Org' },
  { url: 'https://www.deltazeta.org/feed/', label: 'Delta Zeta', category: 'Sorority Org' },
  { url: 'https://www.sigmakappa.org/feed/', label: 'Sigma Kappa', category: 'Sorority Org' },
  { url: 'https://www.kappadelta.org/feed/', label: 'Kappa Delta', category: 'Sorority Org' },
  { url: 'https://www.deltadeltadelta.org/feed/', label: 'Delta Delta Delta', category: 'Sorority Org' },
  { url: 'https://www.alphadelphi.org/feed/', label: 'Alpha Delta Pi', category: 'Sorority Org' },
  { url: 'https://www.phimu.org/feed/', label: 'Phi Mu', category: 'Sorority Org' },

  // ── RUSH COACHING SITES ───────────────────────────────────────────────────
  { url: 'https://getintoasorority.com/feed/', label: 'Get Into A Sorority (Hiking in Heels)', category: 'Rush Coaching' },
  { url: 'https://sororitypackets.com/blogs/rush-101.atom', label: 'Sorority Packets', category: 'Rush Coaching' },
  { url: 'https://blog.phiredup.com/feed/', label: 'Phired Up Blog', category: 'Rush Coaching' },
  { url: 'https://www.franbecque.com/feed/', label: 'Fran Becque (Sorority History)', category: 'Rush Coaching' },
  { url: 'https://greekxp.com/feed/', label: 'GreekXP', category: 'Rush Coaching' },

  // ── YOUTUBE CHANNELS ─────────────────────────────────────────────────────
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLa_vxD-jXlrz_V3FBZcrhA', label: 'Lauren Norris (Alabama Pi Phi)', category: 'YouTube' },

  // ── NATIONAL NEWS / SUBSTACKS ─────────────────────────────────────────────
  { url: 'https://nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/topic/subject/fraternities-and-sororities/rss.xml', label: 'NYT Fraternities & Sororities', category: 'National News' },
  { url: 'https://www.huffpost.com/topic/greek-life/feed', label: 'HuffPost Greek Life', category: 'National News' },
  { url: 'https://annehelen.substack.com/feed', label: 'Anne Helen Petersen', category: 'Substack' },

  // ── SCHOOL PAPERS NOT YET IN SCORE.TS ────────────────────────────────────
  { url: 'https://www.redandblack.com/feed/', label: 'Red & Black (UGA)', category: 'School Paper' },
  { url: 'https://kstatecollegian.com/feed/', label: 'K-State Collegian', category: 'School Paper' },
  { url: 'https://mndaily.com/feed/', label: 'Minnesota Daily', category: 'School Paper' },
  { url: 'https://idsnews.com/feed/', label: 'Indiana Daily Student', category: 'School Paper' },
  { url: 'https://www.dailytarheel.com/feed/', label: 'Daily Tar Heel (UNC)', category: 'School Paper' },
  { url: 'https://www.oudaily.com/feed/', label: 'Oklahoma Daily', category: 'School Paper' },
  { url: 'https://www.kykernel.com/feed/', label: 'Kentucky Kernel', category: 'School Paper' },
  { url: 'https://statenews.com/recent/article.xml', label: 'State News (MSU)', category: 'School Paper' },
  { url: 'https://dailytargum.com/feed/', label: 'Daily Targum (Rutgers)', category: 'School Paper' },
  { url: 'https://www.thedp.com/feed/', label: 'Daily Pennsylvanian', category: 'School Paper' },
  { url: 'https://www.psucollegian.com/feed/', label: 'Daily Collegian (Penn State)', category: 'School Paper' },
  { url: 'https://www.uatrav.com/feed/', label: 'Arkansas Traveler', category: 'School Paper' },
  { url: 'https://tcu360.com/feed/', label: 'TCU 360', category: 'School Paper' },
  { url: 'https://smudailymustang.com/feed/', label: 'SMU Daily Mustang', category: 'School Paper' },

  // ── GREEK LIFE SPECIALTY ──────────────────────────────────────────────────
  { url: 'http://sororitysugar.blogspot.com/feeds/posts/default', label: 'Sorority Sugar', category: 'Greek Specialty' },
  { url: 'https://somethinggreek.com/blogs/posts.atom', label: 'Something Greek', category: 'Greek Specialty' },
  { url: 'https://thesororitylife.com/feed/', label: 'The Sorority Life', category: 'Greek Specialty' },
  { url: 'https://totalsororitymove.com/feed/', label: 'Total Sorority Move', category: 'Greek Specialty' },
]

async function probe(entry: typeof CANDIDATES[0]) {
  try {
    const feed = await parser.parseURL(entry.url)
    const items = feed.items ?? []
    const sample = items.slice(0, 3).map(i => i.title ?? '').filter(Boolean)
    return { ...entry, status: 'ok' as const, count: items.length, sample }
  } catch (e: unknown) {
    const msg = String(e)
    const status = (msg.includes('404') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('410') || msg.includes('403'))
      ? 'dead' as const : 'error' as const
    return { ...entry, status, count: 0, sample: [] as string[] }
  }
}

async function main() {
  console.log(`\nProbing ${CANDIDATES.length} candidate feeds...\n`)

  const results = await Promise.all(CANDIDATES.map(probe))

  const byCategory = new Map<string, typeof results>()
  for (const r of results) {
    if (!byCategory.has(r.category)) byCategory.set(r.category, [])
    byCategory.get(r.category)!.push(r)
  }

  const live = results.filter(r => r.status === 'ok')
  const dead = results.filter(r => r.status === 'dead')
  const errors = results.filter(r => r.status === 'error')

  console.log(`\x1b[1m=== RESULTS BY CATEGORY ===\x1b[0m\n`)
  for (const [cat, entries] of byCategory) {
    console.log(`\x1b[1m${cat}\x1b[0m`)
    for (const r of entries) {
      if (r.status === 'ok') {
        console.log(`  \x1b[32m✓\x1b[0m ${r.label}  (${r.count} items)`)
        if (r.sample.length) console.log(`      \x1b[2m"${r.sample[0]}"\x1b[0m`)
      } else if (r.status === 'dead') {
        console.log(`  \x1b[31m✗\x1b[0m ${r.label}`)
      } else {
        console.log(`  \x1b[33m?\x1b[0m ${r.label}  (timeout/parse error)`)
      }
    }
    console.log()
  }

  console.log(`\x1b[1m=== SUMMARY ===\x1b[0m`)
  console.log(`  Live: \x1b[32m${live.length}\x1b[0m   Dead: \x1b[31m${dead.length}\x1b[0m   Error/Timeout: \x1b[33m${errors.length}\x1b[0m\n`)

  console.log(`\x1b[1m=== LIVE FEED URLs (copy-ready) ===\x1b[0m`)
  for (const r of live) {
    console.log(`  // ${r.label} (${r.count} items)`)
    console.log(`  { url: '${r.url}', source: '${r.label}', topicOnly: false, minScore: 1 },`)
  }
}

main().catch(console.error)
