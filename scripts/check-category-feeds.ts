/**
 * Test feed URLs — shows item count and first headline
 */
import Parser from 'rss-parser'

const CANDIDATES = [
  // --- Greek life specific ---
  { url: 'https://thesororitylife.com/feed/', label: 'The Sorority Life (NPC blog)' },
  { url: 'https://blog.phiredup.com/feed/', label: 'Phired Up (recruitment blog)' },

  // --- College fashion / lifestyle ---
  { url: 'https://collegefashion.net/feed/', label: 'College Fashion' },
  { url: 'https://www.whowhatwear.com/rss', label: 'Who What Wear' },
  { url: 'https://www.popsugar.com/feed', label: 'PopSugar (all)' },
  { url: 'https://www.popsugar.com/fashion/feed', label: 'PopSugar Fashion' },
  { url: 'https://stylecaster.com/feed/', label: 'StyleCaster' },
  { url: 'https://www.theodysseyonline.com/feed/', label: 'Odyssey Online' },

  // --- College newspapers — WordPress likely ---
  { url: 'https://thebatt.com/feed/', label: 'The Battalion (Texas A&M)' },
  { url: 'https://wildcat.arizona.edu/feed/', label: 'Arizona Daily Wildcat' },
  { url: 'https://wp.dailybruin.com/feed/', label: 'Daily Bruin (UCLA)' },
  { url: 'https://reflector-online.com/feed/', label: 'The Reflector (Mississippi State)' },
  { url: 'https://nique.net/feed/', label: 'Georgia Tech Technique' },
  { url: 'https://thetigercu.com/feed/', label: 'The Tiger (Clemson)' },
  { url: 'https://baylorlariat.com/feed/', label: 'Baylor Lariat' },
  { url: 'https://technicianonline.com/feed/', label: 'NC State Technician' },
  { url: 'https://www.thelantern.com/feed/', label: 'The Lantern (Ohio State)' },
  { url: 'https://www.dailycal.org/feed/', label: 'Daily Californian (Berkeley)' },
  { url: 'https://www.oudaily.com/search/?f=rss&t=article', label: 'Oklahoma Daily' },

  // --- SNworks CMS (may fail) ---
  { url: 'https://www.theplainsman.com/search?f=rss&t=article', label: 'Auburn Plainsman' },
  { url: 'https://www.cavalierdaily.com/search?f=rss&t=article', label: 'Cavalier Daily (UVA)' },
  { url: 'https://www.dukechronicle.com/search?f=rss&t=article', label: 'Duke Chronicle' },
  { url: 'https://www.dailygamecock.com/search?f=rss&t=article', label: 'Daily Gamecock (USC)' },

  // --- College paper category feeds ---
  { url: 'https://thecrimsonwhite.com/category/greek-life/feed/', label: 'Crimson White - Greek Life' },
  { url: 'https://thecrimsonwhite.com/tag/sorority/feed/', label: 'Crimson White - sorority tag' },
  { url: 'https://baylorlariat.com/category/news/campuslife/feed/', label: 'Baylor Lariat - campus life' },
  { url: 'https://dailynorthwestern.com/tag/greek-life/feed/', label: 'Daily Northwestern - greek tag' },
  { url: 'https://www.michigandaily.com/tag/greek-life/feed/', label: 'Michigan Daily - greek tag' },
]

type RSSItem = {
  title?: string
  mediaContent?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
  mediaThumbnail?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
  enclosure?: { url?: string; type?: string }
  [key: string]: unknown
}

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 8000,
  customFields: { item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']] },
})

function hasImage(item: RSSItem) {
  if (item.mediaContent) {
    const mc = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent
    if (mc?.$?.url) return true
  }
  if (item.mediaThumbnail) {
    const mt = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail
    if (mt?.$?.url) return true
  }
  return !!(item.enclosure?.url && item.enclosure.type?.startsWith('image'))
}

async function checkFeed(url: string, label: string) {
  try {
    const feed = await parser.parseURL(url)
    const items = feed.items?.slice(0, 5) ?? []
    const imgCount = items.filter(hasImage).length
    const count = items.length
    const sample = items[0]?.title?.slice(0, 65) ?? '(no items)'
    const imgStr = imgCount > 0 ? ` 📷${imgCount}/${count}` : ` (${count} items, no imgs)`
    console.log(`  ✅${imgStr.padEnd(12)} ${label}`)
    if (count > 0) console.log(`     "${sample}"`)
  } catch (e: unknown) {
    const msg = String(e).includes('404') ? '404' :
                String(e).includes('403') ? '403' :
                String(e).includes('timeout') ? 'timeout' :
                String(e).includes('ENOTFOUND') ? 'DNS fail' :
                String(e).slice(0, 50)
    console.log(`  ❌ ${msg.padEnd(10)} ${label}`)
  }
}

async function main() {
  console.log('\nFeed availability check — ' + new Date().toLocaleString() + '\n')
  for (const c of CANDIDATES) {
    await checkFeed(c.url, c.label)
  }
  console.log()
}

main().catch(console.error)
