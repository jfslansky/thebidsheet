import { NextRequest } from 'next/server'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

async function resolveAndScrape(url: string): Promise<{ resolvedUrl?: string; imageUrl?: string }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    })
    if (!res.ok) return {}
    const html = await res.text()
    // If redirect followed us out of google, capture the real URL
    const resolvedUrl = (url.includes('news.google.com') && !res.url.includes('news.google.com'))
      ? res.url : undefined
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    const imageUrl = m?.[1] ? (m[1].startsWith('http') ? m[1] : new URL(m[1], res.url).href) : undefined
    return { resolvedUrl, imageUrl }
  } catch { return {} }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expected = process.env.INGEST_SECRET
  if (secret !== expected) return new Response('unauthorized', { status: 401 })

  const all = await stories.values()
  // Include google news URLs — try HTTP redirect resolution for them too
  const needImage = all
    .filter(s => !s.imageUrl)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 80)

  let fixed = 0
  let resolved = 0
  // Batch in groups of 8 to avoid hammering
  for (let i = 0; i < needImage.length; i += 8) {
    const batch = needImage.slice(i, i + 8)
    await Promise.allSettled(batch.map(async s => {
      const { resolvedUrl, imageUrl } = await resolveAndScrape(s.sourceUrl)
      if (imageUrl || resolvedUrl) {
        const update = { ...s }
        if (resolvedUrl) { update.sourceUrl = resolvedUrl; resolved++ }
        if (imageUrl) { update.imageUrl = imageUrl; fixed++ }
        await stories.set(s.id, update)
      }
    }))
  }

  return Response.json({ scanned: needImage.length, fixed, resolved, total: all.length })
}
