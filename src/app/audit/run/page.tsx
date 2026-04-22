'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuditRunner() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState<'verifying' | 'running' | 'done' | 'error'>('verifying')
  const [report, setReport] = useState('')
  const [error, setError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setError('No payment session found.')
      return
    }

    // 1. Verify payment
    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then(({ paid, metadata }) => {
        if (!paid) {
          setStatus('error')
          setError('Payment not confirmed. Please try again.')
          return
        }

        // 2. Parse audit data from Stripe metadata
        let auditData = {}
        try {
          auditData = JSON.parse(metadata?.auditData || '{}')
        } catch {}

        setStatus('running')

        // 3. Stream the audit
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...auditData, paid: true }),
        }).then((res) => {
          const reader = res.body!.getReader()
          const decoder = new TextDecoder()

          const read = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                setStatus('done')
                return
              }

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    setStatus('done')
                    return
                  }
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.text) {
                      setReport((r) => r + parsed.text)
                      setTimeout(() => {
                        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                      }, 50)
                    }
                    if (parsed.error) {
                      setStatus('error')
                      setError(parsed.error)
                    }
                  } catch {}
                }
              }

              read()
            })
          }
          read()
        })
      })
      .catch(() => {
        setStatus('error')
        setError('Something went wrong. Contact support.')
      })
  }, [sessionId])

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {status === 'verifying' && (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Verifying payment...</p>
        </div>
      )}

      {status === 'running' && report === '' && (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Running your 5-layer audit...</p>
          <p className="text-gray-400 text-sm mt-2">This takes 30–60 seconds</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
          <a href="/audit" className="text-blue-600 text-sm mt-3 inline-block">
            ← Back to audit form
          </a>
        </div>
      )}

      {report && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Meta Ads Audit</h1>
            {status === 'done' && (
              <button
                onClick={() => window.print()}
                className="text-sm text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Print / Save PDF
              </button>
            )}
          </div>

          {status === 'running' && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-4">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              Generating...
            </div>
          )}

          {status === 'done' && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm mb-6">
              Audit complete. Save this page or print to PDF before closing.
            </div>
          )}

          <div
            className="audit-report prose prose-sm max-w-none bg-white border border-gray-200 rounded-xl p-8 whitespace-pre-wrap font-mono text-sm leading-relaxed"
            ref={reportRef}
          >
            {report}
          </div>
        </div>
      )}
    </main>
  )
}

export default function AuditRunPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <AuditRunner />
    </Suspense>
  )
}
