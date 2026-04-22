import Link from 'next/link'

const LAYERS = [
  { num: '1', name: 'Money Model', desc: 'Does your offer pay back CAC within 30 days?', color: 'bg-red-50 border-red-200' },
  { num: '2', name: 'Signal Quality', desc: 'Is Meta receiving clean, matched conversion data?', color: 'bg-orange-50 border-orange-200' },
  { num: '3', name: 'Account Structure', desc: 'Does your structure concentrate signal or fragment it?', color: 'bg-yellow-50 border-yellow-200' },
  { num: '4', name: 'Creative & Entity IDs', desc: 'Enough distinct Entity IDs to reach new audiences?', color: 'bg-blue-50 border-blue-200' },
  { num: '5', name: 'Bid & Budget', desc: 'Is spend deployed where the math actually works?', color: 'bg-green-50 border-green-200' },
]

const STATS = [
  { value: '3.4 MAD', label: 'CPL (beauty, CS001 — market avg: 8–15 MAD)' },
  { value: '10.09×', label: 'ROAS (health & beauty, CS002)' },
  { value: '5 layers', label: 'Diagnostic depth — most agencies check 1' },
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-4">
          Andromeda-Era Meta Ads Audit
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Your Meta ads aren&apos;t broken.
          <br />
          <span className="text-blue-600">Your Money Model might be.</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Most media buyers tune CPM and CTR while the real problem is Layer 1. Get a complete
          5-layer AI audit of your account — from offer economics to creative Entity IDs — in
          under 10 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
          >
            Get Your Audit — 499 MAD
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
          >
            See how it works
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-4">Morocco · MENA · UAE · EU — benchmarks included</p>
      </section>

      {/* Stats */}
      <section className="bg-gray-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-3xl font-extrabold text-blue-400">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 layers */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">The 5-Layer Audit</h2>
        <p className="text-gray-500 text-center mb-12">
          Most agencies only fix Layer 4 or 5. The biggest money is in Layers 1–2.
        </p>
        <div className="space-y-4">
          {LAYERS.map((l) => (
            <div key={l.num} className={`border rounded-xl p-5 flex gap-4 items-start ${l.color}`}>
              <span className="text-2xl font-extrabold text-gray-300 w-8 shrink-0">{l.num}</span>
              <div>
                <p className="font-bold text-gray-800">{l.name}</p>
                <p className="text-gray-600 text-sm mt-0.5">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What you get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              ['30-day CAC Payback Analysis', 'Know if scaling will make or lose money before touching the account.'],
              ['Signal & CAPI Health Check', 'EMQ score, deduplication, attribution window review.'],
              ['Entity ID Audit', 'How many real Entity IDs you have vs near-duplicates that compete with each other.'],
              ['Creative Fatigue & Kill List', 'Exact creatives to kill today and why.'],
              ['Priority Action Stack', 'Today · This week · Next 14 days — ranked by leverage.'],
              ['Morocco/MENA Benchmark Comparison', 'Your metrics vs vertical benchmarks for your market.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="font-bold mb-1">{title}</p>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to stop guessing?</h2>
        <p className="text-gray-500 mb-8">
          Upload your Ads Manager CSV export or paste your key metrics. The AI runs the full audit
          and delivers your report in real time.
        </p>
        <Link
          href="/audit"
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
        >
          Start Audit — 499 MAD
        </Link>
        <p className="text-gray-400 text-sm mt-3">One-time payment. Instant delivery.</p>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} AmraniAds · MetaAudit
      </footer>
    </main>
  )
}
