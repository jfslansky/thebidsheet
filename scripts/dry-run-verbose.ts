/**
 * Inspect college paper feed contents — show raw headlines regardless of score
 */
import Parser from 'rss-parser'

const FEEDS_TO_CHECK = [
  { url: 'https://thecrimsonwhite.com/feed/', source: 'Crimson White' },
  { url: 'https://thedmonline.com/feed/', source: 'Daily Mississippian' },
  { url: 'https://thedailytexan.com/feed/', source: 'Daily Texan' },
  { url: 'https://www.michigandaily.com/feed/', source: 'Michigan Daily' },
  { url: 'https://dailytrojan.com/feed/', source: 'Daily Trojan' },
  { url: 'https://lsureveille.com/feed/', source: 'LSU Reveille' },
  { url: 'https://dailynorthwestern.com/feed/', source: 'Daily Northwestern' },
  { url: 'https://www.utdailybeacon.com/feed/', source: 'Tennessee Beacon' },
  { url: 'https://vanderbilthustler.com/feed/', source: 'Vanderbilt Hustler' },
  { url: 'https://www.tulanehullabaloo.com/feed/', source: 'Tulane Hullabaloo' },
]

type RSSItem = {
  title?: string
  enclosure?: { url?: string; type?: string }
  mediaContent?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
  mediaThumbnail?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
  [key: string]: unknown
}

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 10000,
  customFields: { item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']] },
})

async function main() {
  for (const feed of FEEDS_TO_CHECK) {
    console.log(`\n=== ${feed.source} ===`)
    try {
      const data = await parser.parseURL(feed.url)
      const items = (data.items || []).slice(0, 8)
      if (items.length === 0) { console.log('  (empty)'); continue }
      for (const item of items) {
        const hasImg = !!(
          (item.mediaContent && (Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent)?.$?.url) ||
          (item.mediaThumbnail && (Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail)?.$?.url) ||
          item.enclosure?.url
        )
        console.log(`  ${hasImg ? '📷' : '  '} ${(item.title ?? '').slice(0, 90)}`)
      }
    } catch (e) {
      console.log(`  ERROR: ${e}`)
    }
  }
}

main().catch(console.error)
