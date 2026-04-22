import {
  getAnalyticsSummary, getByCounty, getByCategory, getByMethod,
  getTopSuppliers, getTopEntities, getByStatus, getByMonth, getValueRanges, formatKES
} from '@/lib/api'
import { InContentAd } from '@/components/ads/AdUnit'
import PageLayout from '@/components/layout/PageLayout'
import AnalyticsCharts from '@/components/ui/AnalyticsCharts'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics — Kenya Procurement Spending',
  description: 'Analyse Kenya government procurement spending by county, category, and method.',
}

export default async function AnalyticsPage() {
  const results = await Promise.allSettled([
    getAnalyticsSummary(), getByCounty(), getByCategory(), getByMethod(),
    getTopSuppliers(10), getTopEntities(10), getByStatus(), getByMonth(), getValueRanges(),
  ])

  const [sumR, countyR, catR, methodR, suppR, entR, statR, monthR, valR] = results

  const s         = sumR.status    === 'fulfilled' ? sumR.value    : null
  const allCounties = countyR.status === 'fulfilled' ? countyR.value : []
  const cats      = catR.status    === 'fulfilled' ? catR.value    : []
  const methods   = methodR.status === 'fulfilled' ? methodR.value : []
  const suppliers = suppR.status   === 'fulfilled' ? suppR.value   : []
  const entities  = entR.status    === 'fulfilled' ? entR.value    : []
  const statuses  = statR.status   === 'fulfilled' ? statR.value   : []
  const monthly   = monthR.status  === 'fulfilled' ? monthR.value  : []
  const ranges    = valR.status    === 'fulfilled' ? valR.value    : []

  const topCounty   = allCounties[0]
  const topCategory = [...cats].sort((a,b) => b.total_value - a.total_value)[0]
  const directM     = methods.find(m => m.method?.toLowerCase().includes('direct'))
  const openM       = methods.find(m => m.method?.toLowerCase().includes('open'))
  const maxCount    = allCounties[0]?.tender_count || 1

  return (
    <PageLayout leaderboardSlot="5555555555">
      <div className="space-y-10">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-forest">Procurement Analytics</h1>
          <p className="text-ink-3 text-sm mt-1">
            Kenya government spending breakdown — data updated daily from{' '}
            <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="text-forest underline">tenders.go.ke</a>
          </p>
        </div>

        {/* Headline stats */}
        {s && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Tenders', value: s.total_tenders.toLocaleString(), sub: 'since 2018', icon: '📄', color: 'text-forest' },
              { label: 'Contract Awards', value: s.total_awards.toLocaleString(), sub: 'recorded', icon: '🏆', color: 'text-forest' },
              { label: 'Total Value (KES)', value: formatKES(s.total_contract_value_kes), sub: 'in awarded contracts', icon: '💰', color: 'text-forest' },
              { label: 'Direct Procurement', value: `${s.direct_procurement_pct}%`, sub: 'bypass open tender', icon: s.direct_procurement_pct > 25 ? '⚠️' : '✅', color: s.direct_procurement_pct > 25 ? 'text-red-700' : 'text-forest' },
            ].map(({ label, value, sub, icon, color }) => (
              <div key={label} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-ink-3 text-xs uppercase tracking-wider font-mono font-semibold">{label}</p>
                  <span className="text-2xl">{icon}</span>
                </div>
                <p className={`kes-value text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-ink-3 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Insight strip */}
        {s && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCounty && (
              <Link href={`/analytics/county/${encodeURIComponent(topCounty.county)}`}
                className="card p-4 border-l-4 border-forest hover:border-forest-2 transition-colors group">
                <p className="text-ink-3 text-xs font-mono uppercase tracking-wider mb-1">Most Active County</p>
                <p className="text-forest font-display font-bold text-xl group-hover:underline">📍 {topCounty.county}</p>
                <p className="text-ink-2 text-sm mt-1 font-medium">
                  <span className="kes-value">{topCounty.tender_count.toLocaleString()}</span> tenders ·{' '}
                  <span className="kes-value">{formatKES(topCounty.total_value)}</span>
                </p>
                <p className="text-muted text-xs mt-1">Click to view county analysis →</p>
              </Link>
            )}
            {topCategory && (
              <div className="card p-4 border-l-4 border-gold">
                <p className="text-ink-3 text-xs font-mono uppercase tracking-wider mb-1">Highest Value Category</p>
                <p className="text-amber-900 font-display font-bold text-xl capitalize">📦 {topCategory.category}</p>
                <p className="text-ink-2 text-sm mt-1 font-medium">
                  <span className="kes-value">{formatKES(topCategory.total_value)}</span> in contracts
                </p>
              </div>
            )}
            <div className={`card p-4 border-l-4 ${s.direct_procurement_pct > 25 ? 'border-red-400' : 'border-green-500'}`}>
              <p className="text-ink-3 text-xs font-mono uppercase tracking-wider mb-1">Competition Health</p>
              <p className={`font-display font-bold text-xl ${s.direct_procurement_pct > 25 ? 'text-red-700' : 'text-green-800'}`}>
                {s.direct_procurement_pct > 25 ? '⚠️ Elevated' : '✅ Healthy'}
              </p>
              <p className="text-ink-2 text-sm mt-1 font-medium">
                {openM?.count.toLocaleString() ?? 0} open · {directM?.count.toLocaleString() ?? 0} direct
              </p>
            </div>
          </div>
        )}

        {/* Direct procurement alert */}
        {s && s.direct_procurement_pct > 25 && (
          <div className="p-4 border border-red-200 rounded-xl bg-red-50 flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="text-red-800 font-bold text-sm mb-1">Elevated Direct Procurement: {s.direct_procurement_pct}%</p>
              <p className="text-red-700 text-sm leading-relaxed">
                PPRA permits direct procurement only in exceptional circumstances. High rates may signal governance risk, monitored by civil society and the Auditor General.
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <AnalyticsCharts
          counties={allCounties} categories={cats} methods={methods}
          statuses={statuses} monthly={monthly} ranges={ranges}
        />

        <InContentAd slot="6666666666" />

        {/* ── All Counties Directory ── */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-forest">All 47 Counties</h2>
              <p className="text-ink-3 text-sm mt-1">Click any county for a detailed procurement analysis dashboard</p>
            </div>
            <span className="text-muted text-xs font-mono">{allCounties.length} counties tracked</span>
          </div>

          {allCounties.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-ink-2 font-semibold">No county data yet</p>
              <p className="text-ink-3 text-sm mt-1">Run a sync to populate procurement data</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allCounties.map((county, i) => {
                const barW = Math.max(6, Math.round((county.tender_count / maxCount) * 100))
                const slug = encodeURIComponent(county.county)
                return (
                  <Link key={county.county} href={`/analytics/county/${slug}`}
                    className="card p-4 flex items-center gap-4 group hover:border-forest transition-all animate-fade-in"
                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}>

                    {/* Rank */}
                    <span className="text-muted font-mono text-xs w-5 shrink-0 text-right">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-ink font-bold text-sm group-hover:text-forest transition-colors">
                          📍 {county.county}
                        </span>
                        <span className="kes-value text-forest font-bold text-sm shrink-0 ml-2">
                          {county.tender_count.toLocaleString()}
                        </span>
                      </div>
                      {/* Bar chart */}
                      <div className="w-full bg-cream-3 rounded-full h-1.5 mb-1.5">
                        <div className="bg-forest h-1.5 rounded-full transition-all group-hover:bg-forest-2"
                          style={{ width: `${barW}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted text-xs font-mono">{formatKES(county.total_value)}</span>
                        <span className="text-forest text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          View analysis →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Top suppliers */}
        <div>
          <h2 className="font-display font-bold text-2xl text-forest mb-1">Top Suppliers by Contract Value</h2>
          <p className="text-ink-3 text-sm mb-4">Companies with the highest total awarded contract value</p>
          <div className="card-flat overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-forest text-white text-left">
                  {['#', 'Supplier', 'Contracts', 'Total Value'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-mono uppercase tracking-wider ${h === 'Contracts' || h === 'Total Value' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-3">No award data yet</td></tr>
                ) : suppliers.map((row, i) => (
                  <tr key={i} className="data-row">
                    <td className="px-4 py-3 text-ink-3 font-mono text-xs">{String(i+1).padStart(2,'0')}</td>
                    <td className="px-4 py-3 text-ink font-semibold">{row.supplier}</td>
                    <td className="px-4 py-3 text-ink-2 text-right font-mono">{row.contract_count}</td>
                    <td className="px-4 py-3 text-forest text-right font-mono font-bold">{formatKES(row.total_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top entities */}
        <div>
          <h2 className="font-display font-bold text-2xl text-forest mb-1">Top Spending Entities</h2>
          <p className="text-ink-3 text-sm mb-4">Government bodies with the highest total procurement spend</p>
          <div className="card-flat overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-2 border-b border-divider text-left">
                  {['#', 'Entity', 'County', 'Tenders', 'Total Value'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-mono text-ink-3 uppercase tracking-wider font-semibold ${h === 'Tenders' || h === 'Total Value' ? 'text-right' : ''} ${h === 'County' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-3">No data yet</td></tr>
                ) : entities.map((row, i) => (
                  <tr key={i} className="data-row">
                    <td className="px-4 py-3 text-ink-3 font-mono text-xs">{String(i+1).padStart(2,'0')}</td>
                    <td className="px-4 py-3 text-ink font-semibold">{row.entity}</td>
                    <td className="px-4 py-3 text-ink-3 text-sm hidden sm:table-cell">{row.county || 'National'}</td>
                    <td className="px-4 py-3 text-ink-2 text-right font-mono">{row.tender_count}</td>
                    <td className="px-4 py-3 text-forest text-right font-mono font-bold">{formatKES(row.total_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editorial */}
        <div className="card-flat overflow-hidden">
          <div className="bg-forest px-6 py-4">
            <h2 className="font-display font-bold text-white text-xl">Understanding This Data</h2>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {[
              { title: 'The Legal Framework', body: "Kenya's Public Procurement and Asset Disposal Act 2015 governs how government entities acquire goods, works, and services. Open competitive tendering is the default." },
              { title: 'Direct Procurement', body: 'Direct procurement bypasses competition and is permitted only in exceptional circumstances. Elevated rates are a governance risk indicator tracked by PPRA and the Auditor General.' },
              { title: 'Data Limitations', body: 'PPIP reflects what entities have uploaded. Some entities lag in reporting, classified procurements are excluded, and contract values are estimated budgets.' },
              { title: 'Private Procurement', body: 'TenderWatch covers only public procurement. Private company tenders are not regulated by PPRA. For private tenders, see BrighterMonday, Fuzu, or sector directories.' },
            ].map(({ title, body }) => (
              <div key={title}>
                <h3 className="text-forest font-bold text-sm mb-2 uppercase tracking-wide">{title}</h3>
                <p className="text-ink-3 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  )
}
