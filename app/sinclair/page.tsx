import Link from 'next/link'
import { getLore } from '@/lib/lore'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

const SINCLAIR_PINNED = [
  {
    headline: 'THE MINUTES FROM SESSION D OF THE 2021 NATIONAL CONVENTION WERE NOT CIRCULATED. I WAS IN THAT ROOM.',
    note: 'I am not able to say more at this time. I will say more.',
    date: 'ONGOING',
  },
  {
    headline: 'MY CONSULTANT STATUS WAS SUSPENDED THE SAME MONTH CHAPTER BEGAN FILING PUBLICLY. I AM SIMPLY NOTING THE TIMELINE.',
    note: 'This is a statement of fact. I am making a statement of fact.',
    date: 'FILED 2022-10-14',
  },
]

const SINCLAIR_POOL = [
  {
    headline: 'WHICH NATIONALS REPRESENTATIVES WERE PRESENT AT THE __CONVENTION_MONTH__. 2022 CONVENTION. THE LIST IS SHORTER THAN REPORTED.',
    note: 'Chapter has not addressed this. I notice Chapter has not addressed this.',
    date: 'FILED 2023-02-07',
  },
  {
    headline: 'THE COMPOSITE FROM SPRING 2020 LISTS TWENTY-THREE MEMBERS. I HAVE COUNTED TWENTY-TWO. THE DISCREPANCY HAS NOT BEEN ADDRESSED.',
    note: 'Filed from Nashville. The folder exists.',
    date: 'FILED 2022-11-18',
  },
  {
    headline: 'THREE SEPARATE INSTANCES OF CHAPTER ASSESSING EVENTS THAT HAD NOT YET OCCURRED AT TIME OF FILING.',
    note: 'I have the timestamps. I have kept the timestamps.',
    date: 'FILED 2023-07-03',
  },
  {
    headline: 'THE RISK MANAGEMENT MANUAL WAS REVISED IN AUGUST 2022. I HAVE THE PREVIOUS VERSION. THE DIFFERENCES ARE NOTABLE.',
    note: 'The Commission has characterized the differences as administrative updates. They are not administrative updates.',
    date: 'FILED 2022-09-12',
  },
  {
    headline: 'WHAT THE SCOTTSDALE OFFICE IS ACTUALLY USED FOR (HINT: NOT STANDARDS ASSESSMENT)',
    note: 'I drove past. I want to be clear that I drove past.',
    date: 'FILED 2023-10-04',
  },
  {
    headline: 'THE CONSULTANT WHO BUILT CHAPTER. WHERE THEY WORK NOW. MAKE OF THAT WHAT YOU WILL.',
    note: 'Filed from Nashville. The folder exists.',
    date: 'FILED 2023-01-22',
  },
  {
    headline: 'CHAPTER\'S FIRST PUBLIC ASSESSMENT WAS DATED BEFORE THE CONTRACT THAT AUTHORIZED IT.',
    note: 'I have checked this four times. The date is the date.',
    date: 'FILED 2022-07-15',
  },
  {
    headline: 'THE COMMISSION\'S 501(C)(3) FILING. THE LISTED ACTIVITIES. THE DISCREPANCY.',
    note: null,
    date: 'FILED 2023-12-02',
  },
  {
    headline: 'A PARTIAL LIST OF CHAPTERS THAT RECEIVED THE 2019 ASSESSMENT FRAMEWORK. HOW I OBTAINED IT.',
    note: 'I will not say how I obtained it. The list is real.',
    date: 'FILED 2024-02-08',
  },
  {
    headline: 'THE STANDARDS HEARING IN SPRING 2022 THAT IS NOT IN ANY MEETING LOG I HAVE BEEN ABLE TO LOCATE.',
    note: 'Someone was there. Someone knows.',
    date: 'FILED 2023-09-19',
  },
  {
    headline: 'WHY THE COMMISSION\'S BOARD PAGE HAS BEEN UPDATED FIVE TIMES IN THREE YEARS AND WHAT CHANGED EACH TIME.',
    note: 'I have all five versions. I used the Wayback Machine. This is allowed.',
    date: 'FILED 2024-01-14',
  },
  {
    headline: 'THE EMAIL ADDRESS LISTED FOR THE STANDARDS OFFICE. IT BOUNCES. IT HAS ALWAYS BOUNCED. SOMEONE READS IT.',
    note: null,
    date: 'FILED 2022-10-08',
  },
  {
    headline: 'CHAPTER USED THE PHRASE "AS PREVIOUSLY ASSESSED" IN A FILING THAT REFERENCED AN INCIDENT I CANNOT FIND ANY RECORD OF.',
    note: 'I looked. I am still looking.',
    date: 'FILED 2023-06-03',
  },
  {
    headline: 'THE PERSON WHOSE NAME APPEARS ON THE ORIGINAL CONTRACT. WHAT THEY SAID WHEN I CONTACTED THEM.',
    note: 'They said they could not speak to this. They knew what "this" was before I told them.',
    date: 'FILED 2024-01-30',
  },
  {
    headline: 'THERE IS A SECOND SCOTTSDALE ADDRESS. IT IS NOT LISTED ON THE COMMISSION\'S WEBSITE. I HAVE BEEN THERE.',
    note: 'Lights on. No signage. A car I recognized.',
    date: 'FILED 2024-03-22',
  },
]

export default async function Sinclair() {
  const [lore, allStories] = await Promise.all([getLore(), stories.values()])
  allStories.sort((a, b) => (b.score ?? 1) - (a.score ?? 1) || a.id.localeCompare(b.id))
  const topStory = allStories[0]

  const seed = lore.sinclairSubmissionSeed
  const shuffled = [...SINCLAIR_POOL].sort((a, b) => {
    const ha = Math.sin(seed + SINCLAIR_POOL.indexOf(a)) * 10000
    const hb = Math.sin(seed + SINCLAIR_POOL.indexOf(b)) * 10000
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb))
  })
  const selected = shuffled.slice(0, 6).map(item => ({
    ...item,
    headline: item.headline.replace('__CONVENTION_MONTH__', lore.conventionMonth),
  }))
  const SINCLAIR_ARCHIVE = [...SINCLAIR_PINNED, ...selected]

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--pink-dim)', fontSize: '0.65rem', letterSpacing: '0.15em', textDecoration: 'none' }}>
          ← THE BID REPORT
        </Link>
      </div>

      <div style={{ borderBottom: '2px solid var(--sinclair-text)', paddingBottom: '1.25rem', marginBottom: '2rem', borderTop: '1px solid var(--sinclair-text)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.58rem', color: 'var(--sinclair-text)', letterSpacing: '0.2em', marginBottom: '0.5rem', opacity: 0.7 }}>
          INDEPENDENT ASSESSMENT ARCHIVE — M. SINCLAIR
        </div>
        <h1 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '2rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--sinclair-text)', lineHeight: 1.2 }}>
          M. Sinclair
        </h1>
        <div style={{ fontSize: '0.68rem', color: 'var(--sinclair-text)', marginTop: '0.5rem', opacity: 0.6 }}>
          Former Chapter Assessment Consultant, Iota Commission (2019–2022) ·
          Independent Analyst · Currently: {lore.sinclairLocation} ({lore.sinclairLocationQualifier}) ·
          Last contact: {lore.sinclairLastContact} · Notes filed: {lore.sinclairNoteCount}
        </div>
      </div>

      <div className="sinclair-intrusion" style={{ marginBottom: '2rem' }}>
        <div className="sinclair-byline">STATEMENT FROM M. SINCLAIR</div>
        <div className="sinclair-note" style={{ fontSize: '0.75rem', lineHeight: 1.8, fontStyle: 'normal', color: 'var(--sinclair-text)' }}>
          I want to be clear that I do not have a problem with CHAPTER specifically.
          I have a problem with the conditions under which CHAPTER was developed, the
          parties who commissioned the work, and the fact that nobody at the Commission
          will return my calls. I am keeping records. I have always kept records.
          The newsletter is not currently public but it exists and people receive it.
          If you believe you should be receiving it, you probably should be.
        </div>
      </div>

      {topStory && (
        <div className="sinclair-intrusion" style={{ marginBottom: '2rem' }}>
          <div className="sinclair-byline">CURRENT OBSERVATION — M. SINCLAIR</div>
          <div style={{ fontSize: '0.58rem', color: 'var(--sinclair-text)', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
            REGARDING TODAY&apos;S FEATURED ASSESSMENT · TOPIC: {lore.sinclairCurrentTopic.toUpperCase()}
          </div>
          <Link href={`/story/${topStory.id}`} className="sinclair-headline" style={{ fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            {topStory.headline}
          </Link>
          <div className="sinclair-note">
            I am noting this. I have questions about its framing that I am not in a position to ask publicly.
            The timing is consistent with what I have been tracking regarding {lore.sinclairCurrentTopic}.
            I am not saying these are connected. I am saying I have a folder.
          </div>
        </div>
      )}

      <div className="section-label" style={{ marginBottom: '1rem' }}>FILED ASSESSMENTS</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {SINCLAIR_ARCHIVE.map((item, i) => (
          <div key={i} className="sinclair-intrusion" style={{ marginBottom: '1px' }}>
            <div className="sinclair-byline">{item.date}</div>
            <div className="sinclair-headline" style={{ fontSize: '0.88rem', cursor: 'default' }}>
              {item.headline}
            </div>
            {item.note && <div className="sinclair-note">{item.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--sinclair-text)', marginTop: '2.5rem', paddingTop: '1rem', opacity: 0.3 }}>
        <div style={{ fontSize: '0.58rem', color: 'var(--sinclair-text)', letterSpacing: '0.1em' }}>
          M. Sinclair is not affiliated with the Iota Commission. The Iota Commission has stated this.
          M. Sinclair does not dispute this characterization but notes it is incomplete.
        </div>
      </div>

    </main>
  )
}
