import { NextRequest } from 'next/server'
import { stories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (id) {
    const story = await stories.get(id)
    if (story) await stories.set(id, { ...story, clicks: (story.clicks ?? 0) + 1, clickedAt: Date.now() })
  }
  return new Response(null, { status: 204 })
}
