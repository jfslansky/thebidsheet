'use client'

import { useEffect, useRef } from 'react'

// Same pub ID across all sites — slot IDs are bidreport-specific
// Register these slot IDs in AdSense → My ads → Ad units before going live
const PUB = 'ca-pub-6234356615359295'

type Slot = '300x250' | '300x600' | 'leaderboard' | 'responsive' | 'anchor'

// TODO: replace PENDING_* with real slot IDs from AdSense after creating units
const CONFIGS: Record<Slot, { slotId: string; style: React.CSSProperties; extra: Record<string, string> }> = {
  'leaderboard': {
    slotId: 'PENDING_LEADERBOARD',
    style: { display: 'inline-block', width: '728px', height: '90px' },
    extra: {},
  },
  '300x250': {
    slotId: 'PENDING_300x250',
    style: { display: 'inline-block', width: '300px', height: '250px' },
    extra: {},
  },
  '300x600': {
    slotId: 'PENDING_300x600',
    style: { display: 'inline-block', width: '300px', height: '600px' },
    extra: {},
  },
  'responsive': {
    slotId: 'PENDING_RESPONSIVE',
    style: { display: 'block' },
    extra: { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' },
  },
  'anchor': {
    slotId: 'PENDING_ANCHOR',
    style: { display: 'block' },
    extra: { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' },
  },
}

export function AdUnit({ slot, label = true }: { slot: Slot; label?: boolean }) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch { /* not loaded */ }
  }, [])

  const { slotId, style, extra } = CONFIGS[slot]
  const isPending = slotId.startsWith('PENDING')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
      {label && (
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.42rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          alignSelf: 'flex-start',
        }}>
          Advertisement
        </div>
      )}
      {isPending ? (
        // Dev placeholder — replace with real <ins> after AdSense slot registration
        <div style={{
          ...style,
          background: 'var(--bg-section)',
          border: '1px dashed var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: style.height ? undefined : '90px',
          width: style.width ?? '100%',
        }}>
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.44rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            opacity: 0.5,
          }}>
            {slot} · AdSense pending
          </span>
        </div>
      ) : (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={style}
          data-ad-client={PUB}
          data-ad-slot={slotId}
          {...extra}
        />
      )}
    </div>
  )
}
