'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface AuditRow {
  id: string
  created_at: string
  email: string
  name: string
  account_name: string
  vertical: string
  market: string
  language: string
}

const LANG_FLAG: Record<string, string> = { english: '🇬🇧', french: '🇫🇷', arabic: '🇲🇦' }

function fmt(ts: string) {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminPage() {
  const [audits, setAudits] = useState<AuditRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAudits = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search: query })
    const res = await fetch(`/api/admin/audits?${params}`)
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json()
    setAudits(data.audits || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, query])

  useEffect(() => { fetchAudits() }, [fetchAudits])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-lg">Meta<span className="text-blue-400">Audit</span></span>
          <span className="ml-3 text-gray-400 text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{total} total audits</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Audits', value: total },
            { label: 'This Month', value: audits.filter(a => new Date(a.created_at) > new Date(Date.now() - 30 * 86400000)).length },
            { label: 'Unique Emails', value: new Set(audits.map(a => a.email)).size },
            { label: 'Languages', value: `${new Set(audits.map(a => a.language)).size} used` },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by email, name, or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={() => { setSearch(''); setQuery(''); setPage(1) }}
              className="text-gray-400 border border-gray-700 px-4 py-2.5 rounded-xl text-sm hover:text-white transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-3">📭</p>
              <p>{query ? 'No results found.' : 'No audits yet. They will appear here automatically.'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Account</th>
                  <th className="text-left px-5 py-3">Vertical</th>
                  <th className="text-left px-5 py-3">Market</th>
                  <th className="text-left px-5 py-3">Lang</th>
                  <th className="text-left px-5 py-3">Report</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-gray-800 hover:bg-gray-800 transition ${i % 2 === 0 ? '' : 'bg-gray-900/50'}`}
                  >
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{fmt(a.created_at)}</td>
                    <td className="px-5 py-3 text-blue-400 font-medium">
                      <a href={`mailto:${a.email}`} className="hover:underline">{a.email}</a>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{a.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-300">{a.account_name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {a.vertical || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{a.market || '—'}</td>
                    <td className="px-5 py-3 text-lg">{LANG_FLAG[a.language] || '🌐'}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/audit/${a.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium hover:underline text-xs"
                      >
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 text-sm text-gray-400">
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-700 rounded-lg hover:text-white disabled:opacity-30 transition"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-700 rounded-lg hover:text-white disabled:opacity-30 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
