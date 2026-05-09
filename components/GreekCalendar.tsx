'use client'
import type { FC } from 'react'

type GreekEvent = {
  date: string
  label: string
  note?: string
  type: 'rush' | 'bid' | 'chapter' | 'culture'
  link?: string
}

const EVENTS: GreekEvent[] = [
  // ── Spring 2026 ───────────────────────────────────────────────────────────
  { date: '2026-04-20', label: 'Spring Greek Week', note: 'Greek Week competitions & philanthropy on most campuses', type: 'culture' },
  { date: '2026-04-25', label: 'Spring formal season peak', note: 'Semi-formals and formals across chapters', type: 'culture' },
  { date: '2026-05-01', label: 'Spring initiation ceremonies', note: 'New member initiation across campuses', type: 'chapter' },
  { date: '2026-05-10', label: 'Senior send-offs', note: 'End-of-year celebrations, sister dinners', type: 'chapter' },
  { date: '2026-05-15', label: 'End of year chapter banquets', note: 'Awards, officer transitions, farewells', type: 'chapter' },
  // ── Summer 2026 ──────────────────────────────────────────────────────────
  { date: '2026-07-10', label: 'National convention season', note: 'NPC member org leadership summits', type: 'chapter', link: 'https://www.npcwomen.org' },
  { date: '2026-07-25', label: 'Rush prep season begins', note: 'OOTD content, PNM research, chapter prep', type: 'rush' },
  // ── Fall 2026 Recruitment ─────────────────────────────────────────────────
  { date: '2026-08-05', label: 'Bama Rush begins', note: 'University of Alabama formal recruitment opens', type: 'rush' },
  { date: '2026-08-10', label: 'NPC Formal Recruitment window', note: 'Most major campuses begin recruitment week', type: 'rush', link: 'https://www.npcwomen.org/recruitment/' },
  { date: '2026-08-16', label: 'Preference Night', note: 'Final round before bid day — the emotional one', type: 'rush', link: 'https://www.npcwomen.org/recruitment/' },
  { date: '2026-08-17', label: 'Bid Day (national window)', note: 'PNMs run home', type: 'bid', link: 'https://www.npcwomen.org/recruitment/' },
  { date: '2026-08-22', label: 'Late-schedule Bid Days', note: 'Larger SEC / Big 12 campuses', type: 'bid' },
  // ── Fall 2026 Chapter Life ────────────────────────────────────────────────
  { date: '2026-09-01', label: 'New member education begins', note: 'Pledge class orientation period', type: 'chapter' },
  { date: '2026-09-20', label: 'Big-Little reveal season', note: 'Family reveal events across campuses', type: 'chapter' },
  { date: '2026-10-10', label: 'Homecoming week', note: 'Greek Week competitions, philanthropy events', type: 'culture' },
  { date: '2026-10-24', label: 'Initiation season', note: 'New member initiation ceremonies', type: 'chapter' },
  { date: '2026-11-01', label: 'Fall formal season begins', note: 'Fall formals and semi-formals', type: 'culture' },
  // ── Spring 2027 ───────────────────────────────────────────────────────────
  { date: '2027-01-15', label: 'Spring COB opens', note: 'Continuous Open Bidding / informal recruitment', type: 'rush', link: 'https://www.npcwomen.org/recruitment/' },
  { date: '2027-02-01', label: 'Spring deferred recruitment', note: 'Campuses with delayed rush (Stanford, Dartmouth, etc.)', type: 'rush' },
]

const TYPE_COLOR: Record<GreekEvent['type'], string> = {
  rush:    'var(--gold)',
  bid:     'var(--pink)',
  chapter: 'var(--paper-dim)',
  culture: 'var(--sinclair-accent)',
}

const TYPE_LABEL: Record<GreekEvent['type'], string> = {
  rush:    'Rush',
  bid:     'Bid Day',
  chapter: 'Chapter',
  culture: 'Events',
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysLabel(days: number): string {
  if (days <= 0) return 'now'
  if (days === 1) return 'tmrw'
  if (days < 7) return `${days}d`
  if (days < 30) return `${Math.round(days / 7)}wk`
  return `${Math.round(days / 30)}mo`
}

export const GreekCalendar: FC = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcoming = EVENTS
    .filter(e => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d >= now
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  if (upcoming.length === 0) return null

  return (
    <div style={{ border: '1px solid var(--paper-faint)', position: 'relative' }}>
      <div
        className="section-label"
        style={{ position: 'absolute', top: '-0.65rem', left: '0.75rem', background: 'var(--ink)', padding: '0 0.4rem', borderBottom: 'none', marginBottom: 0 }}
      >
        GREEK CALENDAR
      </div>
      <div style={{ padding: '1.25rem 1rem 0.75rem' }}>
        {upcoming.map((e, i) => {
          const days = daysUntil(e.date)
          const isNear = days <= 7
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                paddingBottom: '0.85rem',
                marginBottom: '0.85rem',
                borderBottom: i < upcoming.length - 1 ? '1px solid var(--paper-faint)' : 'none',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '40px' }}>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.6rem',
                  color: TYPE_COLOR[e.type],
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  opacity: 0.9,
                  fontWeight: isNear ? 700 : 400,
                }}>
                  {formatDate(e.date)}
                </div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.5rem',
                  color: isNear ? TYPE_COLOR[e.type] : 'var(--paper-dim)',
                  marginTop: '0.15rem',
                  opacity: isNear ? 0.9 : 0.55,
                  fontWeight: isNear ? 700 : 400,
                }}>
                  {daysLabel(days)}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.78rem', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.25 }}>
                  {e.link ? (
                    <a href={e.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {e.label}
                    </a>
                  ) : e.label}
                </div>
                {e.note && (
                  <div style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '0.7rem', color: 'var(--paper-dim)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {e.note}
                  </div>
                )}
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.44rem', color: TYPE_COLOR[e.type], marginTop: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.65 }}>
                  {TYPE_LABEL[e.type]}
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.42rem', color: 'var(--paper-dim)', opacity: 0.4, letterSpacing: '0.1em', textAlign: 'center', paddingTop: '0.25rem' }}>
          NPC CALENDAR · DATES APPROXIMATE
        </div>
      </div>
    </div>
  )
}
