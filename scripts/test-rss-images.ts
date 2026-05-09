import Parser from 'rss-parser'

type RSSItem = {
  title?: string
  link?: string
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
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
})

async function testFeed(url: string, label: string) {
  console.log(`\n=== ${label} ===`)
  try {
    const feed = await parser.parseURL(url)
    const items = (feed.items || []).slice(0, 3)
    for (const item of items) {
      console.log(`\nTitle: ${item.title?.slice(0, 70)}`)
      console.log(`  link: ${item.link?.slice(0, 80)}`)
      console.log(`  mediaContent: ${JSON.stringify(item.mediaContent)?.slice(0, 120)}`)
      console.log(`  mediaThumbnail: ${JSON.stringify(item.mediaThumbnail)?.slice(0, 120)}`)
      console.log(`  enclosure: ${JSON.stringify(item.enclosure)?.slice(0, 120)}`)
      const html = item['content:encoded'] ?? item.content
      if (html) {
        const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
        console.log(`  content img: ${m?.[1]?.slice(0, 100) ?? 'none'}`)
      }
      // Also dump all keys
      const keys = Object.keys(item).filter(k => !['title','link','pubDate','isoDate','guid','author','categories','contentSnippet'].includes(k))
      console.log(`  extra keys: ${keys.join(', ')}`)
    }
  } catch (e) {
    console.log(`ERROR: ${e}`)
  }
}

async function main() {
  await testFeed('https://totalsororitymove.com/feed/', 'Total Sorority Move')
  await testFeed('https://www.hercampus.com/feed/', 'Her Campus')
  await testFeed('https://thetab.com/us/feed', 'The Tab')
  await testFeed('https://thecrimsonwhite.com/feed/', 'Crimson White')
  await testFeed('https://news.google.com/rss/search?q=sorority+rush+OR+"bid+day"+OR+recruitment+week&hl=en-US&gl=US&ceid=US:en', 'Rush Wire (Google)')
}

main().catch(console.error)
