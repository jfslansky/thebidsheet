import Anthropic from '@anthropic-ai/sdk'
import { stories } from './store'
import { RUSH_SYSTEM_PROMPT } from './score'
import type { Story } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ANALYSIS_SYSTEM = `You are The Bid Sheet's senior writer — Elle Woods energy, real insider knowledge of Greek life at SEC, Big Ten, ACC, and Big 12 schools. You write punchy feature-style pieces.

Three tight paragraphs, 160–220 words total.
Para 1: What happened and why it matters to Greek life right now — one step past the headline. Specific names, schools, or organizations if known.
Para 2: The pattern, the context — what everyone in the chapter already knows but nobody writes. The stuff that makes your pledge class go "okay but we knew."
Para 3: What this means for rush, for the chapter, for the girls watching. End with a line that makes readers text their group chat immediately.

Sentence case. No headers, no bullets. First person ("I") voice, warm and insider. Never formal. Write like you're telling your big at chapter meeting.`

function needsRepatch(s: Story): boolean {
  if (!s.headline) return false
  return !s.adequateVoice
}

export async function runRepatch(
  limit = 25,
  loopUntilDone = false,
  budgetMs = 50_000,
): Promise<{ patched: number; analyzed: number; error?: string }> {
  const deadline = Date.now() + budgetMs
  let totalPatched = 0
  let totalAnalyzed = 0
  let firstError: string | undefined

  do {
    const result = await runRepatchPass(limit)
    totalPatched += result.patched
    totalAnalyzed += result.analyzed
    if (result.error) { firstError = result.error; break }
    if (result.remaining === 0) break
    if (Date.now() > deadline) break
  } while (loopUntilDone)

  return { patched: totalPatched, analyzed: totalAnalyzed, error: firstError }
}

async function runRepatchPass(limit: number): Promise<{ patched: number; remaining: number; analyzed: number; error?: string }> {
  const all = await stories.values()
  const candidates = all.filter(needsRepatch).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const batch = candidates.slice(0, limit)
  let patched = 0

  if (batch.length > 0) {
    const storiesList = batch.map((s, i) => `${i + 1}. [Source: ${s.source}] ${s.originalHeadline || s.headline}`).join('\n')

    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(batch.length * 250, 8000),
        system: [{ type: 'text', text: RUSH_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as Parameters<typeof client.messages.create>[0]['system'],
        messages: [{
          role: 'user',
          content: `Process these ${batch.length} headlines. Return ONLY a JSON array of ${batch.length} objects in the same order:\n[{"headline":"rewritten — 9–13 words, punchy, sorority clickbait energy, sentence case","adequateVoice":"2–3 sentences, 40–65 words, first-person Elle Woods insider take — real context, personality, sentence case"},…]\n\nHeadlines:\n${storiesList}`,
        }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
      const results: { headline?: string; adequateVoice?: string }[] = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]')

      for (let i = 0; i < batch.length; i++) {
        const result = Array.isArray(results) ? results[i] : null
        if (result?.adequateVoice) {
          await stories.set(batch[i].id, {
            ...batch[i],
            headline: result.headline || batch[i].headline,
            adequateVoice: result.adequateVoice.slice(0, 400),
          })
          patched++
        }
      }
    } catch (e) {
      return { patched: 0, remaining: candidates.length, analyzed: 0, error: String(e) }
    }
  }

  // Pass 2: generate adequateAnalysis for stories with voice but no full article yet
  const afterPatch = await stories.values()
  const needsAnalysis = afterPatch
    .filter(s => s.adequateVoice && !s.adequateAnalysis && s.headline)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)

  let analyzed = 0

  if (needsAnalysis.length > 0) {
    const analysisList = needsAnalysis
      .map((s, i) => `${i + 1}. [Source: ${s.source}] ${s.headline}\nCard take: ${s.adequateVoice}`)
      .join('\n\n')

    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: needsAnalysis.length * 350,
        system: [{ type: 'text', text: ANALYSIS_SYSTEM, cache_control: { type: 'ephemeral' } }] as Parameters<typeof client.messages.create>[0]['system'],
        messages: [{
          role: 'user',
          content: `Write the full feature article for each of these ${needsAnalysis.length} stories. Return ONLY a JSON array:\n[{"adequateAnalysis":"paragraph one\\n\\nparagraph two\\n\\nparagraph three"},…]\n\nStories:\n${analysisList}`,
        }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
      const results: { adequateAnalysis?: string }[] = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]')

      for (let i = 0; i < needsAnalysis.length; i++) {
        const result = Array.isArray(results) ? results[i] : null
        if (result?.adequateAnalysis) {
          await stories.set(needsAnalysis[i].id, { ...needsAnalysis[i], adequateAnalysis: result.adequateAnalysis })
          analyzed++
        }
      }
    } catch { /* non-fatal */ }
  }

  return { patched, remaining: candidates.length - patched, analyzed }
}
