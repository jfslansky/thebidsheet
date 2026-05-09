import { NextRequest } from 'next/server'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    })
    if (!res.ok) return undefined
    const html = await res.text()
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (!m?.[1]) return undefined
    const img = m[1].startsWith('http') ? m[1] : new URL(m[1], res.url).href
    return img
  } catch { return undefined }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expected = process.env.INGEST_SECRET
  if (secret !== expected) return new Response('unauthorized', { status: 401 })

  const all = await stories.values()
  const needImage = all
    .filter(s => !s.imageUrl && !s.sourceUrl.includes('news.google.com'))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 80)

  let fixed = 0
  // Batch in groups of 10 to avoid hammering
  for (let i = 0; i < needImage.length; i += 10) {
    const batch = needImage.slice(i, i + 10)
    await Promise.allSettled(batch.map(async s => {
      const url = await fetchOgImage(s.sourceUrl)
      if (url) {
        await stories.set(s.id, { ...s, imageUrl: url })
        fixed++
      }
    }))
  }

  return Response.json({ scanned: needImage.length, fixed, total: all.length })
}
