import { NextRequest } from 'next/server'
import { runRepatch } from '@/lib/repatch'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret')
  const expected = process.env.REPATCH_SECRET || process.env.INGEST_SECRET
  if (secret !== expected) return new Response('unauthorized', { status: 401 })

  const loop = new URL(req.url).searchParams.get('loop') === 'true'
  const result = await runRepatch(25, loop, 240_000)
  return Response.json(result)
}
