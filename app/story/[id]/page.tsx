import Link from 'next/link'
import { stories } from '@/lib/store'
import { notFound } from 'next/navigation'
import { RushVoice } from '@/components/RushVoice'
import { AdUnit } from '@/components/AdUnit'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = await stories.get(id)
  if (!story) return {}
  const ogTitle = story.headline.length > 55 ? story.headline.slice(0, 52) + '…' : story.headline
  const ogDesc = (story.adequateVoice || `Source: ${story.source}`).slice(0, 155)
  return {
    title: `${ogTitle} | The Bid Sheet`,
    description: ogDesc,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: 'article',
      publishedTime: story.publishedAt,
      ...(story.imageUrl ? { images: [{ url: story.imageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      ...(story.imageUrl ? { images: [story.imageUrl] } : {}),
    },
  }
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = await stories.get(id)
  if (!story) notFound()

  const allStories = await stories.values()
  const related = allStories
    .filter(s => s.id !== id)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6)

  const publishedDate = new Date(story.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: story.headline,
          datePublished: story.publishedAt,
          author: { '@type': 'Organization', name: 'The Bid Sheet' },
          publisher: { '@type': 'Organization', name: 'The Bid Sheet', url: 'https://thebidsheet.com' },
          description: story.adequateVoice || story.headline,
          ...(story.imageUrl ? { image: story.imageUrl } : {}),
        })}}
      />

      {/* Thin top ticker */}
      <div style={{
        background: 'var(--pink)',
        padding: '0.35rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        overflow: 'hidden',
      }}>
        <Link href="/" style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.52rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#fff',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          ← The Bid Sheet
        </Link>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>

          {/* Article column */}
          <div>
            {/* Source & date */}
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              marginBottom: '0.75rem',
            }}>
              {story.source} · {publishedDate}
            </div>

            {/* Category kicker */}
            {(story.fashionScore ?? 0) > (story.hazingScore ?? 0) && (story.fashionScore ?? 0) > (story.rushScore ?? 0) && (
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--pink)',
                marginBottom: '0.5rem',
              }}>Fashion & Style</div>
            )}
            {(story.rushScore ?? 0) > (story.hazingScore ?? 0) && (story.rushScore ?? 0) >= (story.fashionScore ?? 0) && (
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '0.5rem',
              }}>Rush Season</div>
            )}
            {(story.hazingScore ?? 0) >= 6 && (
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--ink-mid)',
                marginBottom: '0.5rem',
              }}>Standards & Accountability</div>
            )}

            {/* Headline */}
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              lineHeight: 1.18,
              color: 'var(--ink)',
              marginBottom: '1.25rem',
              letterSpacing: '-0.01em',
            }}>
              {story.headline}
            </h1>

            {/* Voice */}
            {story.adequateVoice && (
              <div style={{
                borderLeft: '3px solid var(--pink)',
                paddingLeft: '1.25rem',
                marginBottom: '2rem',
              }}>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.5rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--pink)',
                  marginBottom: '0.5rem',
                }}>Inside Take</div>
                <div style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  color: 'var(--ink-mid)',
                }}>
                  <RushVoice text={story.adequateVoice} />
                </div>
              </div>
            )}

            {/* Hero image */}
            {story.imageUrl && (
              <div style={{ marginBottom: '2rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/image?url=${encodeURIComponent(story.imageUrl)}`}
                  alt=""
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Full narrative — adequateAnalysis */}
            {story.adequateAnalysis && (
              <div style={{ marginBottom: '2rem' }}>
                {story.adequateAnalysis.split('\n\n').map((para, i) => (
                  <p key={i} style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '1.08rem',
                    lineHeight: 1.85,
                    color: 'var(--ink)',
                    marginBottom: '1.2rem',
                  }}>{para}</p>
                ))}
              </div>
            )}

            {/* Ad — in-content */}
            <div style={{ marginBottom: '2rem' }}>
              <AdUnit slot="leaderboard" />
            </div>

            {/* Read original */}
            <div style={{
              background: 'var(--bg-section)',
              border: '1px solid var(--rule)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.5rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginBottom: '0.3rem',
                }}>Original Source</div>
                <div style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '0.9rem',
                  color: 'var(--ink-mid)',
                }}>{story.source}</div>
              </div>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--pink)',
                  color: '#fff',
                  padding: '0.65rem 1.5rem',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.58rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.15s',
                }}
              >
                Read Full Story →
              </a>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.5rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  borderBottom: '1px solid var(--rule)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem',
                }}>More from The Bid Sheet</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {related.map(s => (
                    <Link key={s.id} href={`/story/${s.id}`} style={{
                      textDecoration: 'none',
                      padding: '0.75rem 0.5rem 0.75rem 0',
                      borderBottom: '1px solid var(--rule)',
                      display: 'block',
                    }}>
                      <div style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '0.88rem',
                        lineHeight: 1.35,
                        color: 'var(--ink)',
                        marginBottom: '0.25rem',
                      }}>{s.headline}</div>
                      <div style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.52rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-faint)',
                      }}>{s.source}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Score badge */}
            <div style={{
              background: 'var(--bg-section)',
              border: '1px solid var(--rule)',
              padding: '1rem 1.25rem',
            }}>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.48rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: '0.5rem',
              }}>Story Score</div>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '2.2rem',
                fontWeight: 700,
                color: (story.score ?? 0) >= 10 ? 'var(--pink)' : (story.score ?? 0) >= 6 ? 'var(--gold)' : 'var(--ink)',
                lineHeight: 1,
              }}>{story.score ?? 1}</div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.5rem',
                color: 'var(--ink-faint)',
                marginTop: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}>
                {(story.fashionScore ?? 0) > 0 && <span>Fashion: {story.fashionScore}</span>}
                {(story.rushScore ?? 0) > 0 && <span>Rush: {story.rushScore}</span>}
                {(story.hazingScore ?? 0) > 0 && <span>Standards: {story.hazingScore}</span>}
                {(story.viralScore ?? 0) > 0 && <span>Viral: {story.viralScore}</span>}
              </div>
            </div>

            {/* Ad — 300x250 */}
            <AdUnit slot="300x250" />

            {/* Ad — 300x600 */}
            <AdUnit slot="300x600" />

          </div>

        </div>

      </main>
    </>
  )
}
