import { NextRequest } from 'next/server'
import { streamAudit } from '@/lib/claude'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    accountName, dateRange, vertical, market,
    metrics, csvData, additionalContext, language,
    email, name,
  } = body

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullReport = ''

      try {
        await streamAudit(
          { accountName, dateRange, vertical, market, metrics, csvData, additionalContext, language },
          (chunk) => {
            fullReport += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
          }
        )

        // Save to Supabase after streaming completes
        if (email && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          await supabase.from('audits').insert({
            email: email || '',
            name: name || '',
            account_name: accountName || '',
            vertical: vertical || '',
            market: market || '',
            language: language || 'english',
            date_range: dateRange || '',
            metrics: metrics || '',
            additional_context: additionalContext || '',
            report: fullReport,
          })
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Audit failed. Check your API key.' })}\n\n`))
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
