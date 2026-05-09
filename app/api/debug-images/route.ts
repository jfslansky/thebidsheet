import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const all = await stories.values()
  const withImg = all.filter(s => s.imageUrl).length
  const withRssImg = all.filter(s => s.rssImageUrl).length
  const withVoice = all.filter(s => s.adequateVoice).length
  const withAnalysis = all.filter(s => s.adequateAnalysis).length
  const sample = all
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 20)
    .map(s => ({
      id: s.id,
      score: s.score,
      source: s.source,
      hasImage: !!s.imageUrl,
      hasRssImage: !!s.rssImageUrl,
      hasVoice: !!s.adequateVoice,
      hasAnalysis: !!s.adequateAnalysis,
      imageUrl: s.imageUrl?.slice(0, 80) ?? null,
      headline: s.headline.slice(0, 70),
    }))
  return Response.json({
    total: all.length,
    withImage: withImg,
    withRssImage: withRssImg,
    withVoice,
    withAnalysis,
    imageRate: `${Math.round(withImg / all.length * 100)}%`,
    voiceRate: `${Math.round(withVoice / all.length * 100)}%`,
    top20: sample,
  })
}
