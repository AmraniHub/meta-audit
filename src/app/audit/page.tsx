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

const LANGUAGES = [
  { value: 'english', label: '🇬🇧 English' },
  { value: 'french', label: '🇫🇷 Français' },
  { value: 'arabic', label: '🇲🇦 العربية' },
]

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    name: '',
    accountName: '',
    dateRange: '',
    vertical: '',
    market: '',
    language: 'english',
    metrics: '',
    csvData: '',
    additionalContext: '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('csvData', (ev.target?.result as string).slice(0, 8000))
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Collect email in background (don't block the audit)
    fetch('/api/collect-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        name: form.name,
        accountName: form.accountName,
        vertical: form.vertical,
        market: form.market,
      }),
    }).catch(() => {})

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
        Fill in your account info. The AI will diagnose exactly where your ads are losing money —
        creative, offer, price, landing page, or tracking — and tell you what to fix first.
        {!STRIPE_ENABLED && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            Test Mode — Free
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Contact */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-blue-800">Your Contact Info</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2">Report Language *</label>
          <div className="flex gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => set('language', lang.value)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                  form.language === lang.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account basics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account / Brand Name</label>
            <input
              type="text"
              placeholder="e.g. MyShop.ma"
              value={form.accountName}
              onChange={(e) => set('accountName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <input
              type="text"
              placeholder="e.g. Mar 1 – Apr 15 2026"
              value={form.dateRange}
              onChange={(e) => set('dateRange', e.target.value)}
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
              onChange={(e) => set('vertical', e.target.value)}
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
              onChange={(e) => set('market', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select market</option>
              {MARKETS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Your Key Metrics{' '}
            <span className="text-gray-400 font-normal">(the more you give, the deeper the diagnosis)</span>
          </label>
          <textarea
            rows={6}
            placeholder={`Paste your numbers here. Examples:
- Total spend: 8,400 MAD
- Purchases: 142 | Cost per purchase: 59 MAD | ROAS: 4.2×
- Impressions: 320,000 | CTR: 2.1% | CPM: 26 MAD
- Active ads: 18 | Campaigns: 3
- Pixel installed: yes | CAPI connected: no
- Average product price: 350 MAD | Gross margin: ~55%`}
            value={form.metrics}
            onChange={(e) => set('metrics', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CSV */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Ads Manager CSV{' '}
            <span className="text-gray-400 font-normal">(optional — export from Meta Ads Manager)</span>
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
          />
          {form.csvData && (
            <p className="text-green-600 text-xs mt-1">✓ CSV loaded ({form.csvData.length} characters)</p>
          )}
        </div>

        {/* Extra context */}
        <div>
          <label className="block text-sm font-medium mb-1">
            What's your main problem / question?{' '}
            <span className="text-gray-400 font-normal">(optional but helps)</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. My CPL was good last month but doubled this week. I have 5 ads running and they all look similar. My product is 350 MAD and I get around 1 purchase per day..."
            value={form.additionalContext}
            onChange={(e) => set('additionalContext', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading
            ? 'Starting audit...'
            : STRIPE_ENABLED
            ? 'Pay 499 MAD & Run Audit →'
            : 'Run My Audit →'}
        </button>

        <p className="text-center text-gray-400 text-xs">
          {STRIPE_ENABLED
            ? 'Secure payment via Stripe · Report delivered instantly · 499 MAD one-time'
            : 'Test mode — no payment required'}
        </p>
      </form>
    </main>
  )
}
