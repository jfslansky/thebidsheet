import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const all = await stories.values()
  const summary = all.map(s => ({
    id: s.id,
    source: s.source,
    score: s.score,
    hasImage: !!s.imageUrl,
    imageUrl: s.imageUrl ?? null,
    sourceUrl: s.sourceUrl.slice(0, 80),
    headline: s.headline.slice(0, 60),
  }))
  const withImg = summary.filter(s => s.hasImage).length
  return Response.json({ total: all.length, withImage: withImg, stories: summary })
}
