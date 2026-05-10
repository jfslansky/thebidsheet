import { NextRequest } from 'next/server'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const GOOGLE_HOST_RE = /google|gstatic|googleapis|ggpht|googleusercontent/
const SKIP_IMG = /\.svg(\?|$)|\.gif(\?|$)|1x1|spacer|pixel\.gif|tracking\.gif/i

function extractImageFromHtml(html: string, baseUrl: string): string | undefined {
  const meta = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
  if (meta?.[1]) {
    try {
      const u = meta[1].startsWith('http') ? meta[1] : new URL(meta[1], baseUrl).href
      if (!GOOGLE_HOST_RE.test(new URL(u).hostname)) return u
    } catch { /* invalid */ }
  }
  for (const tag of html.matchAll(/<img\b[^>]+>/gi)) {
    const t = tag[0]
    const srcM = t.match(/\bsrc=["']([^"']+)["']/)
      ?? t.match(/\bdata-src=["']([^"']+)["']/)
      ?? t.match(/\bdata-lazy-src=["']([^"']+)["']/)
      ?? t.match(/\bdata-original=["']([^"']+)["']/)
      ?? t.match(/\bdata-lazy=["']([^"']+)["']/)
    if (!srcM) continue
    const src = srcM[1]
    if (!src.startsWith('http')) continue
    if (SKIP_IMG.test(src)) continue
    try { if (GOOGLE_HOST_RE.test(new URL(src).hostname)) continue } catch { continue }
    return src
  }
  return undefined
}

async function resolveAndScrape(url: string): Promise<{ resolvedUrl?: string; imageUrl?: string }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    })
    if (!res.ok) return {}

    // If redirect landed us on a real article (out of google), use that URL
    const resolvedUrl = (url.includes('news.google.com') && !res.url.includes('news.google.com'))
      ? res.url : undefined

    if (!resolvedUrl && url.includes('news.google.com')) return { resolvedUrl }

    const html = await res.text()
    return { resolvedUrl, imageUrl: extractImageFromHtml(html, res.url) }
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
