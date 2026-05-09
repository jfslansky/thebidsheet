import Anthropic from '@anthropic-ai/sdk'
import { stories } from './store'
import { CLOSERS, RUSH_SYSTEM_PROMPT } from './score'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function needsRepatch(s: { adequateVoice?: string; originalHeadline?: string }): boolean {
  if (!s.originalHeadline) return false
  if (!s.adequateVoice) return true
  const v = s.adequateVoice.toLowerCase()
  return v.includes('filed under') || v.includes('filing cabinet')
    || v.includes('does not speculate on causation')
    || v.includes('observes that things continue')
    || v.includes('rush has noted this')
    || v.includes('rush notes that')
}

export async function runRepatch(limit = 50): Promise<{ patched: number; remaining: number; error?: string }> {
  const all = await stories.values()
  const needsPatch = all.filter(needsRepatch)
  const batch = needsPatch.slice(0, limit)

  if (batch.length === 0) return { patched: 0, remaining: 0 }

  const closersList = [...CLOSERS].sort(() => Math.random() - 0.5).map(c => `- ${c}`).join('\n')
  const storiesList = batch.map((s, i) => `${i + 1}. [Source: ${s.source}] ${s.originalHeadline}`).join('\n')

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: Math.min(batch.length * 200, 8000),
      system: [{ type: 'text', text: RUSH_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as Parameters<typeof client.messages.create>[0]['system'],
      messages: [{
        role: 'user',
        content: `Closer examples (use or riff, do not repeat across filings):\n${closersList}\n\nProcess these ${batch.length} headlines. Return ONLY a JSON array of ${batch.length} objects in the same order:\n[{"headline":"rewritten — 9–15 words, specific, no puns, never mention Rush","adequateVoice":"one observation + one closer, under 24 words total, sentence case, must not restate headline"},…]\n\nHeadlines:\n${storiesList}`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
    const results: { headline?: string; adequateVoice?: string }[] = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]')

    let patched = 0
    for (let i = 0; i < batch.length; i++) {
      const result = Array.isArray(results) ? results[i] : null
      if (result?.adequateVoice) {
        await stories.set(batch[i].id, {
          ...batch[i],
          headline: result.headline || batch[i].headline,
          adequateVoice: result.adequateVoice,
        })
        patched++
      }
    }

    return { patched, remaining: needsPatch.length - patched }
  } catch (e) {
    return { patched: 0, remaining: needsPatch.length, error: String(e) }
  }
}
