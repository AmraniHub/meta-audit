'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STRIPE_ENABLED = false

const VERTICALS = [
  'Beauty / Cosmetics',
  'Fashion',
  'Health / Wellness',
  'Home Decor',
  'Baby Products',
  'Electronics Accessories',
  'Real Estate',
  'Coaching / Courses',
  'B2B Services / Agency',
  'Restaurant / Food',
  'Other',
]

const MARKETS = ['Morocco (MAD)', 'UAE (AED)', 'EU → MENA diaspora (EUR)', 'Other']

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    accountName: '',
    dateRange: '',
    vertical: '',
    market: '',
    metrics: '',
    csvData: '',
    additionalContext: '',
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, csvData: (ev.target?.result as string).slice(0, 8000) }))
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!STRIPE_ENABLED) {
      sessionStorage.setItem('auditData', JSON.stringify(form))
      router.push('/audit/run?mode=free')
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData: form }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Get Your Meta Ads Audit</h1>
      <p className="text-gray-500 mb-8">
        Fill in your account details. The more data you provide, the deeper the audit.
        Payment unlocks the full AI report — <strong>499 MAD, one-time.</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account basics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account / Brand Name</label>
            <input
              type="text"
              placeholder="e.g. MyShop.ma"
              value={form.accountName}
              onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Range Analyzed</label>
            <input
              type="text"
              placeholder="e.g. Mar 1 – Apr 15 2026"
              value={form.dateRange}
              onChange={(e) => setForm((f) => ({ ...f, dateRange: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vertical / Industry *</label>
            <select
              required
              value={form.vertical}
              onChange={(e) => setForm((f) => ({ ...f, vertical: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vertical</option>
              {VERTICALS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Market *</label>
            <select
              required
              value={form.market}
              onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select market</option>
              {MARKETS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Key metrics */}
        <div>
          <label className="block text-sm font-medium mb-1">Key Metrics (paste or type)</label>
          <textarea
            rows={5}
            placeholder={`Paste your key numbers, e.g.:
- Total spend: 8,400 MAD
- Purchases: 142 | CPP: 59 MAD | ROAS: 4.2x
- Impressions: 320,000 | CTR: 2.1% | CPM: 26 MAD
- Active campaigns: 3 | Ad sets: 7 | Active ads: 18
- CAPI connected: yes | Pixel EMQ: 7.4`}
            value={form.metrics}
            onChange={(e) => setForm((f) => ({ ...f, metrics: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CSV upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Ads Manager CSV Export <span className="text-gray-400">(optional — deepens the audit)</span>
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
          />
          {form.csvData && (
            <p className="text-green-600 text-xs mt-1">CSV loaded ({form.csvData.length} chars)</p>
          )}
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Context <span className="text-gray-400">(offer, LTV, main problem)</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. We sell a 350 MAD serum with ~55% margin. Average customer buys once. We think creatives are the problem but CPM keeps rising..."
            value={form.additionalContext}
            onChange={(e) => setForm((f) => ({ ...f, additionalContext: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Starting audit...' : STRIPE_ENABLED ? 'Pay 499 MAD & Run Audit' : 'Run Audit (Test Mode)'}
        </button>

        <p className="text-center text-gray-400 text-xs">
          Secure payment via Stripe · Audit runs immediately after payment · MAD / card accepted
        </p>
      </form>
    </main>
  )
}
