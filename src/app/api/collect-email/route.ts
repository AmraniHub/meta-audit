import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, name, vertical, market, accountName } = body

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Log to Vercel runtime logs (visible in Vercel dashboard → Functions → Logs)
  console.log(
    JSON.stringify({
      event: 'audit_lead',
      email,
      name: name || '',
      accountName: accountName || '',
      vertical: vertical || '',
      market: market || '',
      timestamp: new Date().toISOString(),
    })
  )

  return NextResponse.json({ ok: true })
}
