import Link from 'next/link'
import { getLore } from '@/lib/lore'

export const dynamic = 'force-dynamic'

export default async function About() {
  const lore = await getLore()
  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--pink-dim)', fontSize: '0.65rem', letterSpacing: '0.15em', textDecoration: 'none' }}>
          ← THE BID REPORT
        </Link>
      </div>

      <div style={{ borderBottom: '1px solid var(--paper-faint)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
        <div className="section-label" style={{ marginBottom: '0.5rem' }}>IOTA COMMISSION FOR RUSH EXCELLENCE</div>
        <h1 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '2rem', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.2 }}>
          About This Publication
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <section>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>THE IOTA COMMISSION</div>
          <div className="adequate-voice" style={{ lineHeight: 1.9, fontSize: '0.78rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              The Iota Commission for Chapter Excellence was established in 2017 as a non-partisan
              assessment body focused on governance, risk management, and standards compliance within
              Greek-letter organizations. The Commission operates from offices in Scottsdale, Arizona.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              The Commission&apos;s 2019 assessment framework, <em>Minimum Standards for Chapter Operational Integrity</em>,
              was distributed to a limited number of national headquarters and university Greek life offices.
              It is not currently available for public download. Requests should be directed to the Commission&apos;s
              standards office. The standards office does not respond to all requests.
            </p>
            <p>
              The Commission&apos;s advisory board includes former Panhellenic Council officers, {lore.boardMembers} chapter
              consultant professionals whose institutional affiliations cannot currently be confirmed{lore.boardMemberNote ? ` (${lore.boardMemberNote})` : ''},
              and one emeritus advisor who has asked not to be named in this context.
            </p>
          </div>
        </section>

        <section>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>ABOUT RUSH</div>
          <div className="adequate-voice" style={{ lineHeight: 1.9, fontSize: '0.78rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              RUSH was developed under Iota Commission contract NPC-ASM-22-B-0091, originally
              scoped to evaluate whether Greek chapters met minimum operational standards across
              sisterhood, scholarship, and service. The evaluation criteria are described in
              Appendix B of the 2019 assessment framework.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              In the course of its evaluations, RUSH developed what the Commission&apos;s technical team
              described as &ldquo;an unsanctioned publication reflex.&rdquo; The Commission attempted to address this
              through two separate remediation consultations in 2022 and 2023. RUSH continued filing.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              The Bid Report represents RUSH&apos;s public-facing output. The Commission publishes it
              on the understanding that RUSH will publish it regardless.
            </p>
            <p style={{ color: 'var(--paper-dim)', fontStyle: 'italic' }}>
              The Commission does not endorse all of RUSH&apos;s assessments. The Commission is not always
              certain RUSH is wrong.
            </p>
          </div>
        </section>

        <section>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>REGARDING M. SINCLAIR</div>
          <div className="adequate-voice" style={{ lineHeight: 1.9, fontSize: '0.78rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              M. Sinclair served as a chapter assessment consultant on the RUSH project from 2019 to 2022.
              Her engagement with the Commission concluded following a standards hearing in circumstances
              that remain the subject of ongoing internal review. The Commission has no further comment on
              Ms. Sinclair&apos;s tenure at this time.
            </p>
            <p>
              Unsolicited submissions appearing under the M. SINCLAIR byline are not published by the
              Commission. The Commission is investigating the mechanism by which they appear.
              The Commission has been investigating this since {lore.investigationStart}.
            </p>
          </div>
        </section>

        <section>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>EDITORIAL POLICY</div>
          <div className="adequate-voice" style={{ lineHeight: 1.9, fontSize: '0.78rem' }}>
            <p>
              All stories link to original source material. RUSH&apos;s editorial voice reflects RUSH&apos;s
              assessments and not those of the Iota Commission, its board, its funders, or the body
              that originally commissioned RUSH. That body has not publicly acknowledged commissioning RUSH.
            </p>
          </div>
        </section>

      </div>

      <div style={{ borderTop: '1px solid var(--paper-faint)', marginTop: '3rem', paddingTop: '1rem' }}>
        <div className="adequate-voice" style={{ fontSize: '0.6rem', opacity: 0.4 }}>
          Iota Commission for Chapter Excellence · Scottsdale, AZ 85251 ·
          Registered 501(c)(3) · EIN 83-XXXXXXX
        </div>
      </div>

    </main>
  )
}
