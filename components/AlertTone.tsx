'use client'
import { useEffect } from 'react'

const THRESHOLD = 9

export function AlertTone({ score }: { score: number }) {
  useEffect(() => {
    if (score < THRESHOLD) return
    try {
      const ctx = new AudioContext()
      const tones = [392, 247]  // G4 → B3 — descending, unsettling
      let t = ctx.currentTime + 0.15

      for (const freq of tones) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.07, t + 0.025)
        gain.gain.linearRampToValueAtTime(0, t + 0.18)
        osc.start(t)
        osc.stop(t + 0.18)
        t += 0.25
      }

      setTimeout(() => ctx.close(), 1500)
    } catch {}
  }, [])

  return null
}
