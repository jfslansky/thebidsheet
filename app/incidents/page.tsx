import Link from 'next/link'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function Archive() {
  const all = await stories.values()
  const top = all
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime())
    .slice(0, 60)

  const fashionStories = top.filter(s => (s.fashionScore ?? 0) >= 4)
  const rushStories    = top.filter(s => (s.rushScore ?? 0) >= 4 && (s.fashionScore ?? 0) < 4)
  const highScore      = top.filter(s => (s.score ?? 0) >= 8)

  return (
    <>
      <div style={{ background: 'var(--pink)', padding: '0.35rem 1.25rem' }}>
        <Link href="/" style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.52rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#fff',
          textDecoration: 'none',
        }}>
          ← The Bid Sheet
        </Link>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.52rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--pink)',
            marginBottom: '0.75rem',
          }}>Story Archive</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '2.4rem',
            color: 'var(--ink)',
            lineHeight: 1.1,
          }}>The Archive</h1>
          <div style={{
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--ink-faint)',
            marginTop: '0.5rem',
          }}>
            {top.length} stories in the current cycle, sorted by score.
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '1.5rem auto', maxWidth: '200px' }} />
        </div>

        {top.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'var(--ink-mid)',
              lineHeight: 2.2,
            }}>
              The archive is empty.<br />
              This is temporary.<br />
              I have notes ready.
            </div>
          </div>
        )}

        {top.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>
            {top.map((s, i) => {
              const category = (s.fashionScore ?? 0) >= 4
                ? 'Fashion' : (s.rushScore ?? 0) >= 4
                ? 'Rush' : (s.hazingScore ?? 0) >= 6
                ? 'Standards' : 'Chapter Life'
              const categoryColor = category === 'Fashion' ? 'var(--pink)'
                : category === 'Rush' ? 'var(--gold)'
                : category === 'Standards' ? 'var(--ink-mid)'
                : 'var(--ink-faint)'
              return (
                <Link
                  key={s.id}
                  href={`/story/${s.id}`}
                  style={{
                    textDecoration: 'none',
                    padding: '1rem 1.25rem 1rem 0',
                    borderBottom: '1px solid var(--rule)',
                    borderRight: i % 3 !== 2 ? '1px solid var(--rule)' : 'none',
                    paddingRight: i % 3 !== 2 ? '1.25rem' : '0',
                    paddingLeft: i % 3 !== 0 ? '1.25rem' : '0',
                    display: 'block',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}>
                    <div style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.48rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: categoryColor,
                    }}>{category}</div>
                    <div style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.52rem',
                      color: 'var(--ink-faint)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>{s.score ?? 1}</div>
                  </div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.35,
                    color: 'var(--ink)',
                    marginBottom: '0.35rem',
                  }}>{s.headline}</div>
                  <div style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.5rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-faint)',
                  }}>{s.source}</div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Stats footer */}
        {top.length > 0 && (
          <div style={{
            marginTop: '2.5rem',
            borderTop: '1px solid var(--rule)',
            paddingTop: '1.25rem',
            display: 'flex',
            gap: '2.5rem',
          }}>
            {[
              { label: 'Total Stories', value: top.length },
              { label: 'High-Score (8+)', value: highScore.length },
              { label: 'Fashion', value: fashionStories.length },
              { label: 'Rush', value: rushStories.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.48rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginBottom: '0.2rem',
                }}>{label}</div>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}>{value}</div>
              </div>
            ))}
          </div>
        )}

      </main>
    </>
  )
}
