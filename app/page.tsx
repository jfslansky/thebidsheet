import Link from 'next/link'
import { stories } from '@/lib/store'
import { getLore } from '@/lib/lore'
import { RushVoice } from '@/components/RushVoice'
import { AdUnit } from '@/components/AdUnit'
import type { Story } from '@/lib/types'
import {
  FASHION_SIGNALS, RUSH_SIGNALS,
  LIFESTYLE_SOURCES, FASHION_SOURCES, ACCOUNTABILITY_SOURCES,
  COACHING_SOURCES, LOCAL_SOURCES, SORORITY_TERMS,
} from '@/lib/score'

export const dynamic = 'force-dynamic'

// ── Ticker copy — Rush voice, school energy ────────────────────────────────
const TICKER_ITEMS = [
  'Bama Rush is documented · I have every year since 2019 · I prepared',
  'Bid day outfits are a field of study · I am in this field · obviously',
  'Recruitment week is my Super Bowl · I have notes from the previous four',
  'The chapter called it isolated · I have the prior three incidents',
  'I read every rush guide published this season · obviously · they were fine',
  'OmegaFi has not responded to my request for membership data · I will follow up',
  'Standards board convened last Tuesday · I reviewed the agenda beforehand',
  'Legacy bids at SEC schools: documented, analyzed, ready',
  'Greek week philanthropy totals are in · I had the estimate ready in March',
  'The nationals newsletter went out · I read it before it was sent · long story',
  'Bid Day 2026 is coming · I prepared in August · as I always do',
  'Rush coach season has begun · I have watched every available TikTok · obviously',
  'Panhellenic meeting minutes from last semester: not yet public · I am patient',
  'I have thoughts about this recruitment cycle · they are warm thoughts',
]

export default async function Home() {
  const [allStories, lore] = await Promise.all([stories.values(), getLore()])

  // ── Age-decay display score ────────────────────────────────────────────────
  function displayScore(s: Story, categoryScore?: number): number {
    const base = categoryScore ?? s.score ?? 1
    const ageHours = (Date.now() - new Date(s.ingestedAt).getTime()) / 3_600_000
    if (ageHours > 72) return base - 4
    if (ageHours > 48) return base - 2
    if (ageHours > 24) return base - 1
    return base
  }

  allStories.sort((a, b) => displayScore(b) - displayScore(a))

  // ── Category classifiers ───────────────────────────────────────────────────
  const isCoachingStory = (s: Story) => COACHING_SOURCES.has(s.source)

  const isAccountabilityStory = (s: Story) => {
    if (ACCOUNTABILITY_SOURCES.has(s.source)) return true
    const sigs = s.signals ?? []
    const text = `${s.headline} ${s.originalHeadline ?? ''}`.toLowerCase()
    return sigs.some(sig => sig.includes('hazing') || sig.startsWith('tier1:') || sig.startsWith('rush:')) ||
      ['hazing', ' died', ' death', 'killed', 'hospitalized', 'arrested', 'indicted', 'sexual assault'].some(t => text.includes(t))
  }

  const isFashionStory = (s: Story) => {
    if (isAccountabilityStory(s) || isCoachingStory(s)) return false
    if (FASHION_SOURCES.has(s.source)) return true
    const text = `${s.headline} ${s.originalHeadline ?? ''}`.toLowerCase()
    if (!FASHION_SIGNALS.some(k => text.includes(k))) return false
    if (LIFESTYLE_SOURCES.has(s.source)) return SORORITY_TERMS.some(t => text.includes(t))
    return true
  }

  const isRushStory = (s: Story) => {
    if (isAccountabilityStory(s) || isFashionStory(s) || isCoachingStory(s)) return false
    const text = `${s.headline} ${s.originalHeadline ?? ''}`.toLowerCase()
    return RUSH_SIGNALS.some(k => text.includes(k))
  }

  const isLocalStory = (s: Story) => {
    if (isAccountabilityStory(s) || isFashionStory(s) || isRushStory(s)) return false
    return LOCAL_SOURCES.has(s.source)
  }

  const isTeaStory = (s: Story) => {
    if (isAccountabilityStory(s) || isFashionStory(s) || isRushStory(s) || isCoachingStory(s) || isLocalStory(s)) return false
    const text = `${s.headline} ${s.originalHeadline ?? ''}`.toLowerCase()
    const DRAMA = ['viral', 'tiktok', 'went viral', 'rushtok', 'controversy', 'drama', 'backlash',
      'big little', 'sisterhood', 'greek week', 'homecoming', 'pledge class', 'new member',
      'sorority girl', 'sorority life', 'chapter life', 'greek life', 'joining', 'philanthropy']
    const DRAMA_OVERRIDE = ['hazing', 'arrested', 'lawsuit', 'suspended', 'expelled']
    if (DRAMA_OVERRIDE.some(t => text.includes(t))) return false
    return DRAMA.some(k => text.includes(k)) || SORORITY_TERMS.some(t => text.includes(t))
  }

  // ── Splash — never accountability, never coaching ──────────────────────────
  const splash = allStories.find(s => (isFashionStory(s) || isRushStory(s) || isTeaStory(s)) && s.imageUrl)
    ?? allStories.find(s => (isFashionStory(s) || isRushStory(s) || isTeaStory(s)))
    ?? allStories.find(s => !isAccountabilityStory(s) && s.imageUrl)
    ?? allStories[0]

  // ── Pools ──────────────────────────────────────────────────────────────────
  const pool = allStories.filter(s => s.id !== splash?.id && displayScore(s) >= 1)

  // Source diversity cap: max 4 per source across all main sections
  const sourceCounts: Record<string, number> = {}
  const diverse: Story[] = []
  for (const s of pool) {
    if (isCoachingStory(s) || isAccountabilityStory(s)) continue
    if ((sourceCounts[s.source] ?? 0) >= 4) continue
    diverse.push(s)
    sourceCounts[s.source] = (sourceCounts[s.source] ?? 0) + 1
  }

  // Each section sorted by its own category score where available
  const fashionPool = diverse
    .filter(isFashionStory)
    .sort((a, b) => displayScore(b, b.fashionScore) - displayScore(a, a.fashionScore))
    .slice(0, 8)

  const rushPool = diverse
    .filter(isRushStory)
    .sort((a, b) => displayScore(b, b.rushScore) - displayScore(a, a.rushScore))
    .slice(0, 8)

  const teaPool = diverse.filter(isTeaStory).slice(0, 9)
  const localPool = diverse.filter(isLocalStory).slice(0, 6)

  // Coaching sidebar (no cap — these are always on-topic)
  const coachingPool = pool
    .filter(isCoachingStory)
    .slice(0, 5)

  // Accountability sidebar — hard cap 3, sorted by hazingScore
  const accountabilityPool = allStories
    .filter(isAccountabilityStory)
    .sort((a, b) => displayScore(b, b.hazingScore) - displayScore(a, a.hazingScore))
    .slice(0, 3)

  // Main accountability section at bottom — next 4 after sidebar
  const accountabilityMain = allStories
    .filter(isAccountabilityStory)
    .sort((a, b) => displayScore(b, b.hazingScore) - displayScore(a, a.hazingScore))
    .slice(3, 7)

  // ── School spotlight — rotates daily ──────────────────────────────────────
  const SPOTLIGHT_SCHOOLS = ['Alabama', 'Ole Miss', 'Michigan', 'Ohio State', 'Texas',
    'LSU', 'Georgia', 'Kentucky', 'Auburn', 'Tennessee', 'Vanderbilt', 'Arkansas']
  const spotlightSchool = SPOTLIGHT_SCHOOLS[Math.floor(Date.now() / 86400000) % SPOTLIGHT_SCHOOLS.length]
  const spotlightPool = allStories.filter(s =>
    (`${s.headline} ${s.source}`.toLowerCase().includes(spotlightSchool.toLowerCase())) &&
    !isAccountabilityStory(s)
  ).slice(0, 4)

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS].join('   ·   ')

  // ── Helpers ────────────────────────────────────────────────────────────────
  function SectionHeader({ kicker, title, variant }: { kicker: string; title: string; variant: string }) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div className={`section-kicker sh-${variant}`}>{kicker}</div>
        <div className={`section-title sh-${variant}`}>{title}</div>
        <hr className={`section-rule sh-${variant}`} />
      </div>
    )
  }

  function StorySimple({ s }: { s: Story }) {
    return (
      <Link href={`/story/${s.id}`} className="story-link" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="story-headline">{s.headline}</div>
        {s.adequateVoice && <div className="story-voice"><RushVoice text={s.adequateVoice} /></div>}
        <div className="source-tag">{s.source}</div>
      </Link>
    )
  }

  function StoryHorizontal({ s, placeholderClass }: { s: Story; placeholderClass?: string }) {
    return (
      <Link href={`/story/${s.id}`} className="story-card-h" style={{ textDecoration: 'none' }}>
        {s.imageUrl
          ? <img className="story-card-h-img" src={s.imageUrl} alt="" /> // eslint-disable-line @next/next/no-img-element
          : <div className={`story-card-h-placeholder ${placeholderClass ?? ''}`} />
        }
        <div className="story-card-h-body">
          <div className="story-headline" style={{ fontSize: '0.92rem' }}>{s.headline}</div>
          {s.adequateVoice && <div className="story-voice" style={{ fontSize: '0.82rem' }}><RushVoice text={s.adequateVoice} /></div>}
          <div className="source-tag">{s.source}</div>
        </div>
      </Link>
    )
  }

  const fashionLeft  = fashionPool.filter((_, i) => i % 2 === 0)
  const fashionRight = fashionPool.filter((_, i) => i % 2 === 1)
  const rushLeft     = rushPool.filter((_, i) => i % 2 === 0)
  const rushRight    = rushPool.filter((_, i) => i % 2 === 1)
  const teaCols      = [teaPool.filter((_, i) => i % 3 === 0), teaPool.filter((_, i) => i % 3 === 1), teaPool.filter((_, i) => i % 3 === 2)]

  return (
    <>
      {/* Ticker */}
      <div className="ticker-wrap">
        <span className="ticker-label">Rush</span>
        <div className="ticker-scroll">
          <span className="ticker-track">{tickerContent}</span>
        </div>
      </div>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '1.25rem 1.25rem' }}>

        {/* Masthead */}
        <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
          <hr className="masthead-rule-top" />
          <div className="masthead-sub" style={{ padding: '0.35rem 0', letterSpacing: '0.3em' }}>
            Greek Life · Rush Season · Chapter News
          </div>
          <hr className="masthead-rule" />
          <h1 className="masthead-title">The Bid Sheet</h1>
          <hr className="masthead-rule" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', paddingBottom: '0.6rem' }}>
            <div className="masthead-sub">{dateStr}</div>
            <div className="masthead-sub" style={{ opacity: 0.5, letterSpacing: '0.15em' }}>
              {lore.sourcesMonitored} sources · {allStories.length} findings
            </div>
            <div className="masthead-sub">
              <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
              {' · '}
              <Link href="/incidents" style={{ color: 'inherit', textDecoration: 'none' }}>Archive</Link>
            </div>
          </div>
          <hr className="masthead-rule" />
        </div>

        {/* Leaderboard — above fold, highest viewability */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AdUnit slot="leaderboard" />
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span><span className="status-dot" />I&apos;m on it</span>
          <span>{lore.sourcesMonitored} sources monitored</span>
          <span>{allStories.length} stories this cycle</span>
          <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
            Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Hero */}
        {splash && (
          <div className="hero-wrap">
            <div className="hero-image-col">
              {splash.imageUrl
                ? <img src={splash.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> // eslint-disable-line @next/next/no-img-element
                : <div className="hero-image-placeholder" />
              }
            </div>
            <div className="hero-text-col">
              <div>
                <div className="hero-kicker">
                  {isFashionStory(splash) ? 'Fashion & Style' : isRushStory(splash) ? 'Rush Season' : 'Chapter Life'}
                </div>
                <Link href={`/story/${splash.id}`} className="hero-headline">{splash.headline}</Link>
                {splash.adequateVoice && (
                  <div className="hero-voice"><RushVoice text={splash.adequateVoice} /></div>
                )}
              </div>
              <div className="hero-meta">
                <div className="hero-source">{splash.source}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(253,248,245,0.4)', textTransform: 'uppercase' }}>
                  {(splash.score ?? 0) >= 8 ? '⭐ Top Story' : 'Featured'}
                </div>
              </div>
            </div>
          </div>
        )}

        {allStories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--ink-mid)', lineHeight: 2.2 }}>
              I&apos;m getting ready.<br />
              This is taking a moment.<br />
              I find moments productive.
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <a href="/api/ingest?secret=dev" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pink)' }}>
                Initialize Feed →
              </a>
            </div>
          </div>
        )}

        {allStories.length > 0 && (
          <div className="with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>

            {/* Main content */}
            <div>

              {/* ── The Look — Fashion ──────────────────────────────────── */}
              {fashionPool.length > 0 && (
                <div className="section-fashion-bg" style={{ marginBottom: '2rem' }}>
                  <SectionHeader kicker="Fashion & Style" title="The Look" variant="fashion" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div className="col-divider">
                      {fashionLeft.map(s => <StoryHorizontal key={s.id} s={s} />)}
                    </div>
                    <div>
                      {fashionRight.map(s => <StoryHorizontal key={s.id} s={s} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* In-content responsive — between Fashion and Bid Season */}
              <div style={{ margin: '1.5rem 0' }}>
                <AdUnit slot="responsive" />
              </div>

              {/* ── Bid Season — Rush & Recruitment ─────────────────────── */}
              {rushPool.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <SectionHeader kicker="Recruitment & Rush Season" title="Bid Season" variant="rush" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div className="col-divider">
                      {rushLeft.map(s => <StoryHorizontal key={s.id} s={s} placeholderClass="story-card-h-placeholder-rush" />)}
                    </div>
                    <div>
                      {rushRight.map(s => <StoryHorizontal key={s.id} s={s} placeholderClass="story-card-h-placeholder-rush" />)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Chapter Tea — Light / Viral ──────────────────────────── */}
              {teaPool.length > 0 && (
                <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}>
                  <SectionHeader kicker="Greek Life & Campus" title="Chapter Tea" variant="light" />
                  <div className="cols-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1.75rem' }}>
                    <div style={{ borderRight: '1px solid var(--rule)', paddingRight: '1.75rem' }}>
                      {teaCols[0].map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div style={{ borderRight: '1px solid var(--rule)', paddingRight: '1.75rem' }}>
                      {teaCols[1].map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div>
                      {teaCols[2].map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* Ad — mid-feed */}
              <div style={{ margin: '1.5rem 0' }}>
                <AdUnit slot="leaderboard" />
              </div>

              {/* ── Campus — Local & School News ─────────────────────────── */}
              {localPool.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <SectionHeader kicker="School & Local News" title="On Campus" variant="campus" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div className="col-divider">
                      {localPool.filter((_, i) => i % 2 === 0).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div>
                      {localPool.filter((_, i) => i % 2 === 1).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── The Documentation — Accountability (bottom, capped) ──── */}
              {accountabilityMain.length > 0 && (
                <div className="accountability-wrap">
                  <SectionHeader kicker="Standards & Accountability" title="The Documentation" variant="accountability" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: '2rem' }}>
                      {accountabilityMain.filter((_, i) => i % 2 === 0).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div>
                      {accountabilityMain.filter((_, i) => i % 2 === 1).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="sidebar-col" style={{ position: 'sticky', top: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              {/* School Spotlight */}
              {spotlightPool.length > 0 && (
                <div>
                  <div className="sidebar-kicker">School Spotlight</div>
                  <div className="spotlight-school">{spotlightSchool}</div>
                  {spotlightPool.map(s => (
                    <Link key={s.id} href={`/story/${s.id}`} className="sidebar-item">
                      <div className="sidebar-headline">{s.headline}</div>
                      <div className="source-tag" style={{ marginTop: '0.15rem' }}>{s.source}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Ad — 300x250 */}
              <AdUnit slot="300x250" />

              {/* Rush Coaching */}
              {coachingPool.length > 0 && (
                <div className="coaching-card">
                  <div className="coaching-card-label">I Prepared For This</div>
                  {coachingPool.map(s => (
                    <Link key={s.id} href={`/story/${s.id}`} className="sidebar-item" style={{ borderBottomColor: 'rgba(176,136,32,0.2)' }}>
                      <div className="sidebar-headline" style={{ color: 'var(--ink)' }}>{s.headline}</div>
                      <div className="source-tag" style={{ marginTop: '0.15rem' }}>{s.source}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Standards Board — accountability sidebar, max 3 */}
              {accountabilityPool.length > 0 && (
                <div>
                  <div className="sidebar-kicker" style={{ color: 'var(--ink-mid)' }}>Standards Board</div>
                  {accountabilityPool.map(s => (
                    <Link key={s.id} href={`/story/${s.id}`} className="sidebar-item">
                      <div className="sidebar-headline" style={{ fontSize: '0.78rem' }}>{s.headline}</div>
                      <div className="source-tag" style={{ marginTop: '0.15rem' }}>{s.source}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Ad — 300x600 */}
              <AdUnit slot="300x600" />

            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--rule)', marginTop: '2.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--ink-mid)', opacity: 0.6 }}>
            The Bid Sheet · Greek life, rush season, and everything in between.
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            {new Date().getFullYear()} · Obviously.
          </div>
        </div>

      </main>

      {/* Mobile anchor */}
      <div className="mobile-anchor" style={{ display: 'none' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Link href="/incidents" style={{ color: 'inherit', textDecoration: 'none' }}>Archive</Link>
        <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
      </div>
    </>
  )
}
