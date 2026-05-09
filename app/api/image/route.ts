import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !url.startsWith('http')) return new NextResponse(null, { status: 400 })

  try {
    const origin = new URL(url).origin
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': origin + '/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return new NextResponse(null, { status: 404 })
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.startsWith('image/') && !ct.startsWith('application/octet-stream')) {
      return new NextResponse(null, { status: 400 })
    }
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      headers: {
        'Content-Type': ct || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        'Content-Length': String(body.byteLength),
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
