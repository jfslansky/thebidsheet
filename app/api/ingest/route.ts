import { ingestFeeds } from '@/lib/ingest'
import { stories } from '@/lib/store'
import { NextRequest } from 'next/server'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const expected = process.env.INGEST_SECRET

  if (process.env.NODE_ENV === 'production' && secret !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (process.env.NODE_ENV !== 'production' && expected && secret !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (request.nextUrl.searchParams.get('flush') === 'true') {
    await stories.clear()
  }

  const count = await ingestFeeds()
  const total = await stories.size()
  return Response.json({ ok: true, ingested: count, total })
}
