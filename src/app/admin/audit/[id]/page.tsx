'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface AuditFull {
  id: string
  created_at: string
  email: string
  name: string
  account_name: string
  vertical: string
  market: string
  language: string
  date_range: string
  metrics: string
  additional_context: string
  report: string
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminAuditDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'report' | 'input'>('report')

  useEffect(() => {
    fetch(`/api/admin/audit/${id}`)
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        return r.json()
      })
      .then(data => { if (data) setAudit(data); setLoading(false) })
  }, [id, router])

  const handleDownload = () => {
    if (!audit) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Audit — ${audit.email}</title>
    <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px}</style></head>
    <body><h2>MetaAudit — ${audit.account_name || audit.email} — ${fmt(audit.created_at)}</h2>
    <pre>${audit.report.replace(/</g,'&lt;')}</pre></body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!audit) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center"><p className="text-xl mb-4">Audit not found</p>
      <Link href="/admin" className="text-blue-400 hover:underline">← Back to dashboard</Link></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">{audit.account_name || audit.email}</span>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ⬇ Download PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* User info card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Contact</p>
            <p className="font-semibold text-white">{audit.name || '—'}</p>
            <a href={`mailto:${audit.email}`} className="text-blue-400 text-sm hover:underline">{audit.email}</a>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Account</p>
            <p className="text-white">{audit.account_name || '—'}</p>
            <p className="text-gray-400 text-sm">{audit.vertical} · {audit.market}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Submitted</p>
            <p className="text-white">{fmt(audit.created_at)}</p>
            <p className="text-gray-400 text-sm capitalize">{audit.language} · {audit.date_range || 'no date range'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
          {(['report', 'input'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'report' ? '📊 Audit Report' : '📋 User Input'}
            </button>
          ))}
        </div>

        {tab === 'report' && (
          <div
            dir={audit.language === 'arabic' ? 'rtl' : 'ltr'}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-200"
          >
            {audit.report || <span className="text-gray-500 italic">No report saved</span>}
          </div>
        )}

        {tab === 'input' && (
          <div className="space-y-4">
            {[
              { label: 'Metrics Provided', value: audit.metrics },
              { label: 'Additional Context', value: audit.additional_context },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">{label}</p>
                <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {value || <span className="text-gray-600 italic">Not provided</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
