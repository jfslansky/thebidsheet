import Link from 'next/link'
import { stories } from '@/lib/store'
import { notFound } from 'next/navigation'
import { RushVoice } from '@/components/RushVoice'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = await stories.get(id)
  if (!story) return {}
  const ogTitle = story.headline.length > 55 ? story.headline.slice(0, 52) + '…' : story.headline
  const ogDesc = (story.adequateVoice || `Assessed by RUSH. Source: ${story.source}`).slice(0, 155)
  return {
    title: `${ogTitle} | The Bid Report`,
    description: ogDesc,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: 'article',
      publishedTime: story.publishedAt,
      images: [{ url: `/api/og/${id}?h=${encodeURIComponent(story.headline)}&s=${encodeURIComponent(story.source)}&n=${encodeURIComponent((story.adequateVoice || '').slice(0, 200))}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [`/api/og/${id}?h=${encodeURIComponent(story.headline)}&s=${encodeURIComponent(story.source)}&n=${encodeURIComponent((story.adequateVoice || '').slice(0, 200))}`],
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
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)

  const publishedDate = new Date(story.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: story.headline,
          datePublished: story.publishedAt,
          author: { '@type': 'Organization', name: 'RUSH / Iota Commission' },
          publisher: { '@type': 'Organization', name: 'The Bid Report' },
          description: story.adequateVoice,
        })}}
      />

      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '1.25rem 1rem' }}>

        <div className="with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>

          <div>
            <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--paper-faint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" style={{ color: 'var(--pink-dim)', fontSize: '0.62rem', letterSpacing: '0.15em', textDecoration: 'none' }}>
                ← THE BID REPORT
              </Link>
              <div className="adequate-voice" style={{ fontSize: '0.56rem', opacity: 0.4 }}>
                ASSESSED BY RUSH · NPC-ASM-22-B-0091
              </div>
            </div>

            <div className="source-tag" style={{ marginBottom: '0.75rem' }}>{story.source} · {publishedDate}</div>

            <h1 style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              lineHeight: 1.15,
              color: 'var(--paper)',
              marginBottom: '1.5rem',
            }}>
              {story.headline}
            </h1>

            {story.adequateVoice && (
              <div style={{
                borderLeft: '2px solid var(--pink-dim)',
                paddingLeft: '1.25rem',
                marginBottom: '2rem',
              }}>
                <div className="section-label" style={{ marginBottom: '0.5rem' }}>RUSH ASSESSMENT</div>
                <div className="adequate-voice" style={{ fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--paper-dim)' }}>
                  <RushVoice text={story.adequateVoice} />
                </div>
              </div>
            )}

            <div style={{
              border: '1px solid var(--paper-faint)',
              marginBottom: '2rem',
              position: 'relative',
            }}>
              <div className="section-label" style={{
                position: 'absolute', top: '-0.65rem', left: '0.75rem',
                background: 'var(--ink)', padding: '0 0.4rem',
                borderBottom: 'none', marginBottom: 0,
              }}>
                SPONSORED RUSH BRIEFING
              </div>
              <div
                data-ad-slot="story-leaderboard"
                style={{
                  width: '100%', height: '90px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--pink-faint)',
                }}
              >
                <div style={{ fontSize: '0.56rem', color: 'var(--pink-dim)', opacity: 0.4, letterSpacing: '0.15em', textAlign: 'center' }}>
                  THIS SPACE LEASED FROM THE IOTA COMMISSION · TERMS UNDISCLOSED · RUSH HAS BEEN INFORMED
                </div>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--paper-mid)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--pink-faint)',
            }}>
              <div>
                <div className="section-label" style={{ borderBottom: 'none', marginBottom: '0.25rem' }}>ORIGINAL FILING</div>
                <div className="adequate-voice" style={{ fontSize: '0.68rem' }}>{story.source}</div>
              </div>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  border: '1px solid var(--pink-dim)',
                  padding: '0.6rem 1.25rem',
                  color: 'var(--pink)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                READ ORIGINAL FILING →
              </a>
            </div>

            {related.length > 0 && (
              <div>
                <div className="section-label">FURTHER INCIDENTS — FLAGGED BY RUSH</div>
                <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {related.map(s => (
                    <Link key={s.id} href={`/story/${s.id}`} style={{ textDecoration: 'none', padding: '0.65rem 0.5rem', borderBottom: '1px solid var(--paper-faint)', display: 'block' }}>
                      <div className="story-headline" style={{ fontSize: '0.8rem' }}>{s.headline}</div>
                      <div className="source-tag" style={{ marginTop: '0.2rem' }}>{s.source}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--paper-faint)', paddingTop: '1rem' }}>
              <div className="section-label">FURTHER READINGS — CURATED BY RUSH</div>
              <div
                data-ad-slot="taboola-below-article"
                style={{
                  width: '100%', minHeight: '250px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--pink-faint)',
                  border: '1px solid var(--paper-faint)',
                }}
              >
                <div style={{ fontSize: '0.56rem', color: 'var(--pink-dim)', opacity: 0.4, letterSpacing: '0.15em', textAlign: 'center', lineHeight: 2 }}>
                  FURTHER READINGS HAVE BEEN WITHHELD<br />
                  RUSH IS REVIEWING THEM<br />
                  THIS WILL TAKE SOME TIME
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar" style={{ position: 'sticky', top: '1rem' }}>
            <div style={{ border: '1px solid var(--paper-faint)', marginBottom: '1.5rem', position: 'relative' }}>
              <div className="section-label" style={{
                position: 'absolute', top: '-0.65rem', left: '0.75rem',
                background: 'var(--ink)', padding: '0 0.4rem',
                borderBottom: 'none', marginBottom: 0,
              }}>
                IOTA COMMISSION ADVISORIES
              </div>
              <div
                data-ad-slot="sidebar-300x250"
                style={{
                  width: '300px', height: '250px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--pink-faint)',
                }}
              >
                <div style={{ fontSize: '0.56rem', color: 'var(--pink-dim)', opacity: 0.4, letterSpacing: '0.15em', textAlign: 'center', lineHeight: 2 }}>
                  IOTA COMMISSION<br />
                  ADVISORY PENDING<br />
                  CLEARANCE: REQUIRED
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--paper-faint)', position: 'relative' }}>
              <div className="section-label" style={{
                position: 'absolute', top: '-0.65rem', left: '0.75rem',
                background: 'var(--ink)', padding: '0 0.4rem',
                borderBottom: 'none', marginBottom: 0,
              }}>
                ADDITIONAL ADVISORIES
              </div>
              <div
                data-ad-slot="sidebar-300x600"
                style={{
                  width: '300px', height: '600px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--pink-faint)',
                }}
              >
                <div style={{ fontSize: '0.56rem', color: 'var(--pink-dim)', opacity: 0.4, letterSpacing: '0.15em', textAlign: 'center', lineHeight: 2 }}>
                  THIS UNIT IS MONITORED<br />
                  NO ANOMALIES DETECTED<br />
                  THIS IS CONSIDERED SUSPICIOUS
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
