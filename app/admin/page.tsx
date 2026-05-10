import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const all = await stories.values()
  const total = all.length
  const withImage = all.filter(s => s.imageUrl).length
  const withVoice = all.filter(s => s.adequateVoice).length
  const withAnalysis = all.filter(s => s.adequateAnalysis).length

  const secret = process.env.INGEST_SECRET ?? ''
  const top = all.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 30)

  const row: React.CSSProperties = {
    display: 'flex', gap: '1rem', alignItems: 'baseline',
    padding: '0.5rem 0', borderBottom: '1px solid #ecdce4',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
  }
  const tag: React.CSSProperties = {
    fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '0.15rem 0.4rem', borderRadius: 3,
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.25rem', fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        The Bid Sheet — Admin
      </h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Stories', value: total },
          { label: 'With Image', value: `${withImage} (${Math.round(withImage/total*100)}%)` },
          { label: 'With Voice', value: `${withVoice} (${Math.round(withVoice/total*100)}%)` },
          { label: 'With Analysis', value: `${withAnalysis} (${Math.round(withAnalysis/total*100)}%)` },
        ].map(s => (
          <div key={s.label} style={{ background: '#fdf8f5', border: '1px solid #ecdce4', padding: '1rem' }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c4a8b4', marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#1c1218' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Run Ingest', href: `/api/ingest?secret=${secret}`, color: '#c8336a' },
          { label: 'Run Repatch (loop)', href: `/api/repatch?secret=${secret}&loop=true`, color: '#b08820' },
          { label: 'Fix Images', href: `/api/fix-images?secret=${secret}`, color: '#5a3a48' },
          { label: 'Debug Stats', href: `/api/debug-images`, color: '#1c1218' },
        ].map(a => (
          <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" style={{
            background: a.color, color: '#fff', padding: '0.6rem 1.25rem',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>{a.label}</a>
        ))}
      </div>

      {/* Story table */}
      <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c4a8b4', marginBottom: '0.5rem' }}>
        Top 30 stories
      </div>
      {top.map(s => (
        <div key={s.id} style={row}>
          <div style={{ width: 32, color: '#c4a8b4', flexShrink: 0 }}>{s.score}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <a href={`/story/${s.id}`} style={{ color: '#1c1218', textDecoration: 'none' }}>
              {s.headline.slice(0, 80)}
            </a>
            <div style={{ color: '#c4a8b4', fontSize: '0.65rem', marginTop: 2 }}>{s.source}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <span style={{ ...tag, background: s.imageUrl ? '#d4edda' : '#f8d7da', color: s.imageUrl ? '#155724' : '#721c24' }}>img</span>
            <span style={{ ...tag, background: s.adequateVoice ? '#d4edda' : '#f8d7da', color: s.adequateVoice ? '#155724' : '#721c24' }}>voice</span>
            <span style={{ ...tag, background: s.adequateAnalysis ? '#d4edda' : '#f8d7da', color: s.adequateAnalysis ? '#155724' : '#721c24' }}>analysis</span>
          </div>
        </div>
      ))}
    </main>
  )
}
