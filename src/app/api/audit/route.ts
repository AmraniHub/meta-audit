import { NextRequest } from 'next/server'
import { streamAudit } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { accountName, dateRange, vertical, market, metrics, csvData, additionalContext, paid } =
    body

  // In production: verify payment via Stripe before running audit
  // For now we accept a `paid: true` flag from the checkout flow
  if (!paid) {
    return new Response(JSON.stringify({ error: 'Payment required' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamAudit(
          { accountName, dateRange, vertical, market, metrics, csvData, additionalContext },
          (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
          }
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Audit failed' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
