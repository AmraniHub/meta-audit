'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function renderReport(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const k = key++

    // Horizontal rules / dividers
    if (line.match(/^━+$/)) {
      elements.push(<hr key={k} className="border-gray-200 my-1" />)
      continue
    }
    if (line.match(/^---+$/)) {
      elements.push(<div key={k} className="my-4" />)
      continue
    }

    // Section headings that start with emoji + uppercase
    if (line.match(/^[🎯🚨📊🔍💡✅🔮]/)) {
      elements.push(
        <h2 key={k} className="text-xl font-bold mt-8 mb-3 text-gray-900 flex items-start gap-2">
          {line}
        </h2>
      )
      continue
    }

    // Bold layer headings like **Layer 1 — ...**
    if (line.match(/^\*\*[^*]+\*\*$/)) {
      const text = line.replace(/\*\*/g, '')
      elements.push(
        <h3 key={k} className="text-base font-bold mt-6 mb-2 text-blue-700">
          {text}
        </h3>
      )
      continue
    }

    // Lines with **bold** inline
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={k} className="mb-1 leading-relaxed">
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      )
      continue
    }

    // Action arrows
    if (line.startsWith('→')) {
      elements.push(
        <div key={k} className="flex items-start gap-2 mb-1 ml-4">
          <span className="text-blue-500 font-bold mt-0.5">→</span>
          <span className="text-gray-700">{line.slice(1).trim()}</span>
        </div>
      )
      continue
    }

    // Verdict lines with ✅ ⚠️ ❌
    if (line.startsWith('Verdict:') || line.match(/^(Verdict|النتيجة|Résultat|الحكم)/)) {
      const isGood = line.includes('✅')
      const isWarn = line.includes('⚠️')
      const isBad = line.includes('❌')
      const color = isGood ? 'text-green-700 bg-green-50' : isBad ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'
      elements.push(
        <div key={k} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mb-3 ${color}`}>
          {line}
        </div>
      )
      continue
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={k} className="flex items-start gap-2 mb-1 ml-2">
          <span className="text-gray-400 mt-1">•</span>
          <span className="text-gray-700">{line.slice(2).trim()}</span>
        </div>
      )
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={k} className="h-2" />)
      continue
    }

    // Default paragraph
    elements.push(
      <p key={k} className="text-gray-700 leading-relaxed mb-1">
        {line}
      </p>
    )
  }

  return elements
}

function AuditRunner() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const mode = params.get('mode')
  const [status, setStatus] = useState<'verifying' | 'running' | 'done' | 'error'>('verifying')
  const [report, setReport] = useState('')
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('english')
  const bottomRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const streamAudit = (auditData: Record<string, unknown>) => {
    if (auditData.language) setLanguage(auditData.language as string)
    setStatus('running')

    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData),
    }).then((res) => {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) { setStatus('done'); return }

          const chunk = decoder.decode(value)
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') { setStatus('done'); return }
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                setReport((r) => r + parsed.text)
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
              }
              if (parsed.error) { setStatus('error'); setError(parsed.error) }
            } catch {}
          }
          read()
        })
      }
      read()
    }).catch(() => { setStatus('error'); setError('Audit failed. Please try again.') })
  }

  useEffect(() => {
    if (mode === 'free') {
      try {
        const raw = sessionStorage.getItem('auditData')
        const auditData = raw ? JSON.parse(raw) : {}
        sessionStorage.removeItem('auditData')
        streamAudit(auditData)
      } catch {
        setStatus('error')
        setError('Could not load audit data. Please go back and try again.')
      }
      return
    }

    if (!sessionId) {
      setStatus('error')
      setError('No session found. Please start the audit again.')
      return
    }

    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then(({ paid, metadata }) => {
        if (!paid) { setStatus('error'); setError('Payment not confirmed. Please try again.'); return }
        let auditData = {}
        try { auditData = JSON.parse(metadata?.auditData || '{}') } catch {}
        streamAudit({ ...auditData, paid: true })
      })
      .catch(() => { setStatus('error'); setError('Something went wrong. Please try again.') })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mode])

  const handleDownload = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${language === 'arabic' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>MetaAudit Report</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; line-height: 1.6; }
          h1 { color: #1877F2; border-bottom: 2px solid #1877F2; padding-bottom: 10px; }
          pre { white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; font-size: 14px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>MetaAudit Report — AmraniAds</h1>
        <pre>${report.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        <p style="margin-top:40px; color:#888; font-size:12px;">Generated by MetaAudit · amraniads.com</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  const isRTL = language === 'arabic'

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Loading — no report yet */}
      {(status === 'verifying' || (status === 'running' && !report)) && (
        <div className="text-center py-24">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="animate-spin absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600" />
            <div className="absolute inset-2 rounded-full bg-blue-50 flex items-center justify-center text-xl">🔍</div>
          </div>
          <p className="text-gray-800 font-semibold text-lg">Analysing your account...</p>
          <p className="text-gray-400 text-sm mt-2">Diagnosing Money Model · Signal · Structure · Creative · Bid Strategy</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-red-700 font-semibold text-lg mb-2">{error}</p>
          <a href="/audit" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            ← Try Again
          </a>
        </div>
      )}

      {/* Report */}
      {report && (
        <div>
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Audit Report</h1>
              {status === 'running' && (
                <div className="flex items-center gap-2 text-blue-600 text-sm mt-1">
                  <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                  Generating...
                </div>
              )}
            </div>
            {status === 'done' && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition print:hidden"
              >
                <span>⬇</span> Download Report (PDF)
              </button>
            )}
          </div>

          {status === 'done' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-6 flex items-center gap-2 print:hidden">
              <span>✅</span>
              <span>Audit complete — download your report or scroll through it below.</span>
            </div>
          )}

          {/* Report content */}
          <div
            ref={reportRef}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-[15px]"
          >
            {renderReport(report)}
            <div ref={bottomRef} />
          </div>

          {/* Bottom download */}
          {status === 'done' && (
            <div className="mt-8 text-center print:hidden">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-blue-700 transition"
              >
                ⬇ Download Full Report (PDF)
              </button>
              <p className="text-gray-400 text-xs mt-3">
                Opens a print dialog — save as PDF from your browser
              </p>
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
                <p className="font-semibold mb-1">Want help implementing these fixes?</p>
                <p>
                  Contact AmraniAds at{' '}
                  <a href="mailto:amrani4online@gmail.com" className="underline font-medium">
                    amrani4online@gmail.com
                  </a>
                  {' '}or{' '}
                  <a href="https://wa.me/212600000000" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default function AuditRunPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <AuditRunner />
    </Suspense>
  )
}
