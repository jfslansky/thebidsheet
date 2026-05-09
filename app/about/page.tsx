import Link from 'next/link'
import { getLore } from '@/lib/lore'

export const dynamic = 'force-dynamic'

export default async function About() {
  const lore = await getLore()

  return (
    <>
      <div style={{
        background: 'var(--pink)',
        padding: '0.35rem 1.25rem',
      }}>
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

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.52rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--pink)',
            marginBottom: '0.75rem',
          }}>About This Publication</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '2.8rem',
            color: 'var(--ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}>The Bid Sheet</h1>
          <div style={{
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--ink-mid)',
            marginTop: '0.75rem',
          }}>Greek life, rush season, and everything in between.</div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '1.5rem 0' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <section>
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.52rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.75rem',
            }}>What We Cover</div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--ink-mid)' }}>
              <p style={{ marginBottom: '1rem' }}>
                The Bid Sheet covers Greek life at Big Ten, SEC, ACC, and Ivy League schools — rush
                season, bid day, chapter culture, fashion, and campus accountability. We aggregate
                reporting from college newspapers, Greek life publications, national outlets, and
                campus sources across {lore.sourcesMonitored ?? 'hundreds of'} feeds.
              </p>
              <p>
                If it&apos;s happening in a chapter house, at a recruitment event, on bid day, or in the
                group chat — we have notes on it. We prepared. Obviously.
              </p>
            </div>
          </section>

          <section>
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.52rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.75rem',
            }}>Editorial Voice</div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--ink-mid)' }}>
              <p style={{ marginBottom: '1rem' }}>
                Our editorial perspective is informed by the rush coach archetype — authoritative,
                warm, and entirely prepared. We follow recruitment cycles, chapter news, fashion
                trends, and campus accountability with the same level of meticulous documentation
                that the best rush consultants bring to bid day weekend.
              </p>
              <p>
                Every headline is scored across four dimensions: Fashion, Rush, Viral, and Standards.
                Stories surface in the section where they perform best — fashion stories don&apos;t compete
                with accountability reporting, and vice versa.
              </p>
            </div>
          </section>

          <section>
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.52rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.75rem',
            }}>Sources</div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--ink-mid)' }}>
              <p style={{ marginBottom: '1rem' }}>
                We monitor {lore.sourcesMonitored ?? 'hundreds of'} RSS feeds including college newspapers
                at SEC, Big Ten, ACC, and Big 12 schools; fashion and lifestyle publications; Greek life
                coaching sources; national accountability reporting; and school-specific news feeds
                via Google News.
              </p>
              <p>
                All stories link directly to original source material. We don&apos;t publish, we aggregate
                and assess.
              </p>
            </div>
          </section>

          <section style={{ background: 'var(--bg-section)', padding: '1.5rem', borderTop: '3px solid var(--pink)' }}>
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.52rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--pink)',
              marginBottom: '0.75rem',
            }}>Editorial Policy</div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.0rem', lineHeight: 1.85, color: 'var(--ink-mid)' }}>
              All stories link to original source material. Headlines are summarized and scored
              algorithmically. Editorial voice commentary is generated to match the publication&apos;s
              perspective. Accountability coverage is deliberately limited and placed at the bottom
              of the page — this is a publication for the Greek life community, not a watchdog.
            </div>
          </section>

        </div>

        <div style={{
          borderTop: '1px solid var(--rule)',
          marginTop: '3rem',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            color: 'var(--ink-faint)',
          }}>
            The Bid Sheet · thebidsheet.com
          </div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.5rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
          }}>
            {new Date().getFullYear()} · Obviously.
          </div>
        </div>

      </main>
    </>
  )
}
