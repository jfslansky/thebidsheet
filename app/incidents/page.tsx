import Link from 'next/link'
import { stories } from '@/lib/store'
import { RushVoice } from '@/components/RushVoice'

export const dynamic = 'force-dynamic'

const INCIDENT_THRESHOLD = 7

export default async function Incidents() {
  const all = await stories.values()
  const incidents = all
    .filter(s => (s.score ?? 0) >= INCIDENT_THRESHOLD)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime())

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--pink-dim)', fontSize: '0.65rem', letterSpacing: '0.15em', textDecoration: 'none' }}>
          ← THE BID REPORT
        </Link>
      </div>

      <div style={{ borderBottom: '2px solid var(--paper-mid)', paddingBottom: '1.25rem', marginBottom: '2rem', borderTop: '1px solid var(--paper-faint)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.58rem', color: 'var(--paper-dim)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          IOTA COMMISSION CLASSIFICATION: ELEVATED
        </div>
        <h1 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.6rem', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.2 }}>
          INCIDENT LOG
        </h1>
        <div style={{ fontSize: '0.68rem', color: 'var(--paper-dim)', marginTop: '0.5rem' }}>
          Assessments flagged as requiring elevated attention. CHAPTER has flagged {incidents.length} incident{incidents.length !== 1 ? 's' : ''}.
          The threshold for inclusion is not published. The threshold exists.
        </div>
      </div>

      {incidents.length === 0 && (
        <div className="adequate-voice" style={{ lineHeight: 2.4, fontSize: '0.78rem' }}>
          No incidents have met the threshold at this time.<br />
          CHAPTER notes this is statistically unlikely.<br />
          CHAPTER is continuing to monitor.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {incidents.map((story) => (
          <div key={story.id} style={{ borderBottom: '1px solid var(--paper-faint)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.54rem', color: 'var(--pink-dim)', letterSpacing: '0.15em', marginBottom: '0.35rem', display: 'flex', gap: '1rem' }}>
              <span>INCIDENT · SEVERITY {story.score ?? '?'}</span>
              <span style={{ opacity: 0.5 }}>
                {new Date(story.ingestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </span>
              <span style={{ opacity: 0.5 }}>{story.source.toUpperCase()}</span>
            </div>
            <Link
              href={`/story/${story.id}`}
              style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem', fontWeight: 500, color: 'var(--paper)', textDecoration: 'none', lineHeight: 1.5, display: 'block', marginBottom: '0.35rem' }}
            >
              {story.headline}
            </Link>
            {story.adequateVoice && (
              <div className="adequate-voice" style={{ fontSize: '0.72rem' }}><RushVoice text={story.adequateVoice} /></div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--paper-faint)', marginTop: '2rem', paddingTop: '1rem', opacity: 0.35 }}>
        <div style={{ fontSize: '0.58rem', color: 'var(--paper-dim)', letterSpacing: '0.1em' }}>
          Incidents are retained beyond standard archival windows. This is not an accident.
          CHAPTER does not discard elevated assessments. CHAPTER has been asked to.
        </div>
      </div>

    </main>
  )
}
