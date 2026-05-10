import Link from 'next/link'
import Image from 'next/image'
import { stories } from '@/lib/store'
import { RushVoice } from '@/components/RushVoice'
import { AdUnit } from '@/components/AdUnit'
import type { Story } from '@/lib/types'
import {
  FASHION_SIGNALS, RUSH_SIGNALS, FEEDS,
  LIFESTYLE_SOURCES, FASHION_SOURCES, ACCOUNTABILITY_SOURCES,
  COACHING_SOURCES, LOCAL_SOURCES, SORORITY_TERMS,
} from '@/lib/score'

export const dynamic = 'force-dynamic'

// ── Ticker — sorority girl energy, not bureaucrat ──────────────────────────
const TICKER_ITEMS = [
  'BamaRush 2026 · I have notes from every year since 2019 · obviously',
  'Delta Delta Delta can I help ya help ya help ya · yes actually I can',
  'Bid day is the happiest day of the year · fight me on this',
  'Rush outfit formula: linen set + white sneakers + confidence · done',
  'The clean girl aesthetic was invented by a Pi Phi · probably · it tracks',
  'Chapter rankings just dropped · my predictions were correct · as expected',
  'Sorority TikTok is basically a documentary series at this point · I watch all of them',
  'Big little reveal season is the purest chaos on earth · love to see it',
  'OPI Bubble Bath is still the official nail color of rush · tradition means something',
  'Panhellenic drama is always more complicated than you think · I have the full timeline',
  'Philanthropy season incoming · outfits planned · check',
  'The group chat after bid day is the most chaotic place on the internet',
  'Formal recruitment week is basically the Olympics for your wardrobe',
  'Greek week > regular week · I stand by this · always have',
  'New rush guide dropped · I had already read the draft · obviously',
  'Sisterhood > everything · this is not up for debate',
]

export default async function Home() {
  const allStories = await stories.values()

  // ── Age-decay display score ────────────────────────────────────────────────
  function displayScore(s: Story, categoryScore?: number): number {
    const base = categoryScore ?? s.score ?? 1
    const ageHours = (Date.now() - new Date(s.ingestedAt).getTime()) / 3_600_000
    if (ageHours > 72) return base - 4
    if (ageHours > 48) return base - 2
    if (ageHours > 24) return base - 1
    return base
  }

  allStories.sort((a, b) => (b.score ?? 1) - (a.score ?? 1))

  // ── Category classifiers ───────────────────────────────────────────────────
  const isFraternityOnly = (s: Story) => {
    const text = `${s.headline} ${s.originalHeadline ?? ''}`.toLowerCase()
    return (text.includes('fraternity') || text.includes('frat ')) &&
      !text.includes('sorority') && !text.includes('panhellenic') &&
      !text.includes('greek life') && !text.includes('hazing')
  }

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

  // ── Splash — sorority first, never fraternity-only, never accountability ───
  const isSplashEligible = (s: Story) =>
    !isAccountabilityStory(s) && !isCoachingStory(s) && !isFraternityOnly(s)

  const splash = allStories.find(s => isSplashEligible(s) && (isFashionStory(s) || isRushStory(s)) && s.imageUrl)
    ?? allStories.find(s => isSplashEligible(s) && s.imageUrl)
    ?? allStories.find(s => isSplashEligible(s) && (isFashionStory(s) || isRushStory(s) || isTeaStory(s)))
    ?? allStories.find(s => isSplashEligible(s))
    ?? allStories[0]

  // ── Pools — filter by score not display-score so new stories always show ───
  const pool = allStories.filter(s => s.id !== splash?.id && (s.score ?? 1) >= 1)

  // Source diversity cap: max 6 per source across all main sections
  const sourceCounts: Record<string, number> = {}
  const diverse: Story[] = []
  for (const s of pool) {
    if (isCoachingStory(s) || isAccountabilityStory(s)) continue
    if (isFraternityOnly(s)) continue
    if ((sourceCounts[s.source] ?? 0) >= 6) continue
    diverse.push(s)
    sourceCounts[s.source] = (sourceCounts[s.source] ?? 0) + 1
  }

  // Each section sorted by its own category score
  const fashionPool = diverse
    .filter(isFashionStory)
    .sort((a, b) => (b.fashionScore ?? b.score ?? 0) - (a.fashionScore ?? a.score ?? 0))
    .slice(0, 18)

  const rushPool = diverse
    .filter(isRushStory)
    .sort((a, b) => (b.rushScore ?? b.score ?? 0) - (a.rushScore ?? a.score ?? 0))
    .slice(0, 18)

  const teaPool = diverse.filter(isTeaStory).slice(0, 18)

  // Campus: anything not already categorized — catches general Greek life content
  const categorized = new Set([
    ...fashionPool.map(s => s.id),
    ...rushPool.map(s => s.id),
    ...teaPool.map(s => s.id),
  ])
  const campusPool = diverse
    .filter(s => !categorized.has(s.id))
    .slice(0, 10)

  const localPool = diverse.filter(isLocalStory).filter(s => !categorized.has(s.id)).slice(0, 6)

  // Coaching sidebar — one per source to prevent dupes
  const coachingPool = (() => {
    const seen = new Set<string>()
    return pool.filter(isCoachingStory).filter(s => {
      if (seen.has(s.source)) return false
      seen.add(s.source)
      return true
    }).slice(0, 5)
  })()

  // Accountability sidebar — hard cap 3
  const accountabilityPool = allStories
    .filter(isAccountabilityStory)
    .sort((a, b) => (b.hazingScore ?? 0) - (a.hazingScore ?? 0))
    .slice(0, 3)

  // Main accountability section at bottom — next 4 after sidebar
  const accountabilityMain = allStories
    .filter(isAccountabilityStory)
    .sort((a, b) => (b.hazingScore ?? 0) - (a.hazingScore ?? 0))
    .slice(3, 7)

  // ── School spotlight — rotates daily ──────────────────────────────────────
  const SPOTLIGHT_SCHOOLS = ['Alabama', 'Ole Miss', 'Michigan', 'Ohio State', 'Texas',
    'LSU', 'Georgia', 'Kentucky', 'Auburn', 'Tennessee', 'Vanderbilt', 'Arkansas']
  const spotlightSchool = SPOTLIGHT_SCHOOLS[Math.floor(Date.now() / 86400000) % SPOTLIGHT_SCHOOLS.length]
  const spotlightPool = allStories.filter(s =>
    (`${s.headline} ${s.source}`.toLowerCase().includes(spotlightSchool.toLowerCase())) &&
    !isAccountabilityStory(s)
  ).slice(0, 4)

  const sourceCount = FEEDS.length

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
        {s.adequateVoice && (
          <div className="story-voice"><RushVoice text={s.adequateVoice} /></div>
        )}
        <div className="source-tag">{s.source}</div>
      </Link>
    )
  }

  // Overlay card — image fills the card, text overlaid on gradient (primary card type)
  function StoryCardOverlay({ s, variant }: { s: Story; variant?: 'fashion' | 'rush' }) {
    const phClass = variant === 'fashion' ? 'story-card-o-ph-fashion' : variant === 'rush' ? 'story-card-o-ph-rush' : 'story-card-o-ph'
    return (
      <Link href={`/story/${s.id}`} className="story-card-o">
        <div className="story-card-o-wrap">
          {s.imageUrl
            ? <Image fill src={s.imageUrl} alt="" style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 30vw" />
            : <div className={`story-card-o-ph ${phClass}`} />
          }
          <div className="story-card-o-grad" />
          <div className="story-card-o-text">
            <div className="story-card-o-source">{s.source}</div>
            <div className="story-card-o-hed">{s.headline}</div>
          </div>
        </div>
        {s.adequateVoice && (
          <div className="story-card-o-voice"><RushVoice text={s.adequateVoice.split(/(?<=[.!?])\s+/)[0]} /></div>
        )}
      </Link>
    )
  }

  function StoryHorizontal({ s, placeholderClass }: { s: Story; placeholderClass?: string }) { // kept for potential use
    return (
      <Link href={`/story/${s.id}`} className="story-card-h" style={{ textDecoration: 'none' }}>
        {s.imageUrl
          ? <div style={{ position: 'relative', flexShrink: 0, width: 110, height: 85 }}><Image fill src={s.imageUrl!} alt="" style={{ objectFit: 'cover' }} sizes="110px" /></div>
          : <div className={`story-card-h-placeholder ${placeholderClass ?? ''}`} />
        }
        <div className="story-card-h-body">
          <div className="story-headline" style={{ fontSize: '0.92rem' }}>{s.headline}</div>
          {s.adequateVoice && (
            <div className="story-voice" style={{ fontSize: '0.82rem' }}>
              <RushVoice text={s.adequateVoice} />
            </div>
          )}
          <div className="source-tag">{s.source}</div>
        </div>
      </Link>
    )
  }

  const localLeft = localPool.filter((_, i) => i % 2 === 0)
  const localRight = localPool.filter((_, i) => i % 2 === 1)

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
              {sourceCount} sources · {allStories.length} findings
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
          <span>{sourceCount} sources monitored</span>
          <span>{allStories.length} stories this cycle</span>
          <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
            Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Hero — fullbleed image with text overlay */}
        {splash && (
          <Link href={`/story/${splash.id}`} className="hero-v2">
            {splash.imageUrl
              ? <Image fill src={splash.imageUrl} alt="" style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} sizes="100vw" priority />
              : <div className="hero-v2-ph" />
            }
            <div className="hero-v2-grad" />
            <div className="hero-v2-content">
              <div className="hero-kicker">
                {isFashionStory(splash) ? 'Fashion & Style' : isRushStory(splash) ? 'Rush Season' : 'Chapter Life'}
              </div>
              <div className="hero-v2-hed">{splash.headline}</div>
              {splash.adequateVoice && (
                <div className="hero-voice"><RushVoice text={splash.adequateVoice} /></div>
              )}
              <div className="hero-source" style={{ marginTop: '0.85rem' }}>{splash.source}</div>
            </div>
          </Link>
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

              {/* ── The Look — Fashion (3-col overlay grid) ─────────────── */}
              {fashionPool.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <SectionHeader kicker="Fashion & Style" title="The Look" variant="fashion" />
                  <div className="grid-3col">
                    {fashionPool.slice(0, 6).map(s => <StoryCardOverlay key={s.id} s={s} variant="fashion" />)}
                  </div>
                  {fashionPool.length > 6 && (
                    <div className="grid-3col" style={{ marginTop: '1.25rem' }}>
                      {fashionPool.slice(6, 12).map(s => <StoryCardOverlay key={s.id} s={s} variant="fashion" />)}
                    </div>
                  )}
                </div>
              )}

              {/* In-content responsive ad */}
              <div style={{ margin: '1.5rem 0' }}>
                <AdUnit slot="responsive" />
              </div>

              {/* ── Bid Season — Rush & Recruitment (3-col overlay grid) ──── */}
              {rushPool.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <SectionHeader kicker="Recruitment & Rush Season" title="Bid Season" variant="rush" />
                  <div className="grid-3col">
                    {rushPool.slice(0, 6).map(s => <StoryCardOverlay key={s.id} s={s} variant="rush" />)}
                  </div>
                  {rushPool.length > 6 && (
                    <div className="grid-3col" style={{ marginTop: '1.25rem' }}>
                      {rushPool.slice(6, 12).map(s => <StoryCardOverlay key={s.id} s={s} variant="rush" />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Chapter Tea (3-col overlay grid) ─────────────────────── */}
              {teaPool.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <SectionHeader kicker="Greek Life & Campus" title="Chapter Tea" variant="light" />
                  <div className="grid-3col">
                    {teaPool.slice(0, 6).map(s => <StoryCardOverlay key={s.id} s={s} />)}
                  </div>
                  {teaPool.length > 6 && (
                    <div className="grid-3col" style={{ marginTop: '1.25rem' }}>
                      {teaPool.slice(6, 12).map(s => <StoryCardOverlay key={s.id} s={s} />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Campus & Chapter — catch-all ─────────────────────────── */}
              {campusPool.length > 0 && (
                <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}>
                  <SectionHeader kicker="Campus & Chapter" title="In The News" variant="campus" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div className="col-divider">
                      {campusPool.filter((_, i) => i % 2 === 0).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div>
                      {campusPool.filter((_, i) => i % 2 === 1).map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* Ad — mid-feed */}
              <div style={{ margin: '1.5rem 0' }}>
                <AdUnit slot="leaderboard" />
              </div>

              {/* ── Local — School-specific news ─────────────────────────── */}
              {localPool.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <SectionHeader kicker="School & Local News" title="On Campus" variant="campus" />
                  <div className="story-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    <div className="col-divider">
                      {localLeft.map(s => <StorySimple key={s.id} s={s} />)}
                    </div>
                    <div>
                      {localRight.map(s => <StorySimple key={s.id} s={s} />)}
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
                  <div className="coaching-card-label">Rush Insider</div>
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
