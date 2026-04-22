import { getCountyAnalytics, getTenders, formatKES, formatDate, statusClass, methodClass } from '@/lib/api'
import PageLayout from '@/components/layout/PageLayout'
import CountyCharts from '@/components/ui/CountyCharts'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { county: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.county).replace(/-/g, ' ')
  return {
    title: `${name} County — Procurement Analysis`,
    description: `Procurement analytics for ${name} County — tender counts, contract values, spending trends, and top entities.`,
  }
}

export default async function CountyPage({ params }: Props) {
  const countySlug = decodeURIComponent(params.county)
  const countyName = countySlug.replace(/-/g, ' ')

  const [analyticsResult, tendersResult] = await Promise.allSettled([
    getCountyAnalytics(countyName),
    getTenders({ county: countyName, per_page: '8', status: 'active' } as any),
  ])

  if (analyticsResult.status === 'rejected' || !analyticsResult.value?.summary) {
    notFound()
  }

  const data = analyticsResult.value
  const tenders = tendersResult.status === 'fulfilled' ? tendersResult.value.tenders : []
  const s = data.summary

  const directPctClass = s.direct_procurement_pct > 30
    ? 'text-red-700' : s.direct_procurement_pct > 15
    ? 'text-amber-700' : 'text-green-700'

  return (
    <PageLayout>
      <div className="space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted flex-wrap">
          <Link href="/" className="hover:text-forest transition-colors">Home</Link>
          <span>/</span>
          <Link href="/analytics" className="hover:text-forest transition-colors">Analytics</Link>
          <span>/</span>
          <span className="text-ink-2 font-semibold">📍 {data.county} County</span>
        </nav>

        {/* Header */}
        <div className="card-flat overflow-hidden">
          <div className="bg-forest px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-gold-2 text-xs font-mono uppercase tracking-widest mb-1">County Procurement Analysis</p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
                  📍 {data.county} County
                </h1>
                <p className="text-white/70 text-sm mt-1">Procurement data from tenders.go.ke — updated daily</p>
              </div>
              <Link href={`/tenders?county=${encodeURIComponent(data.county)}`}
                className="shrink-0 px-4 py-2 bg-gold text-forest font-bold rounded-lg hover:bg-gold-2 transition-colors text-sm shadow-sm">
                Browse Tenders →
              </Link>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-divider">
            {[
              { label: 'Total Tenders', value: s.total_tenders.toLocaleString(), icon: '📄', sub: 'all time', color: 'text-forest' },
              { label: 'Active Now', value: s.active_tenders.toLocaleString(), icon: '🟢', sub: 'open tenders', color: 'text-green-700' },
              { label: 'Total Value', value: formatKES(s.total_value), icon: '💰', sub: 'estimated spend', color: 'text-forest' },
              { label: 'Direct Procurement', value: `${s.direct_procurement_pct}%`, icon: s.direct_procurement_pct > 25 ? '⚠️' : '✅', sub: 'of all tenders', color: directPctClass },
            ].map(({ label, value, icon, sub, color }) => (
              <div key={label} className="bg-white p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-ink-3 text-xs font-mono uppercase tracking-wider">{label}</p>
                  <span className="text-lg">{icon}</span>
                </div>
                <p className={`kes-value text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-muted text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {s.direct_procurement_pct > 25 && (
          <div className="p-4 border border-red-200 rounded-xl bg-red-50 flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="text-red-800 font-bold text-sm mb-1">
                High Direct Procurement Rate in {data.county} County: {s.direct_procurement_pct}%
              </p>
              <p className="text-red-700 text-sm leading-relaxed">
                {s.direct_count} of {s.total_tenders} tenders in {data.county} County were awarded through direct procurement, bypassing open competition. PPRA permits this only in exceptional circumstances.
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <CountyCharts data={data} />

        {/* Active tenders */}
        {tenders.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-xl text-forest">Active Tenders in {data.county}</h2>
                <p className="text-ink-3 text-xs mt-0.5">{s.active_tenders} open tenders currently accepting bids</p>
              </div>
              <Link href={`/tenders?county=${encodeURIComponent(data.county)}&status=active`}
                className="text-forest text-sm font-semibold hover:underline hidden sm:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {tenders.map((tender, i) => (
                <Link key={tender.id} href={`/tenders/${tender.id}`}
                  className="tender-card block p-4 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-ink font-bold text-sm leading-snug line-clamp-2 flex-1">
                      {tender.title || 'Untitled Tender'}
                    </h3>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${statusClass(tender.status)}`}>
                      {tender.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="kes-value text-forest font-bold">{formatKES(tender.value_amount)}</span>
                    {tender.procurement_method && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${methodClass(tender.procurement_method)}`}>
                        {tender.procurement_method}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-divider pt-2">
                    <p className="text-ink-3 text-xs truncate max-w-[60%]">{tender.entity?.name ?? '—'}</p>
                    {tender.tender_period_end && (
                      <p className="text-muted text-xs font-mono">Closes {formatDate(tender.tender_period_end)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top entities */}
        {data.top_entities.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-forest mb-1">Top Spending Entities</h2>
            <p className="text-ink-3 text-sm mb-4">Government bodies with the highest procurement spend in {data.county} County</p>
            <div className="card-flat overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-forest text-white">
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider">Tenders</th>
                    <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_entities.map((row, i) => (
                    <tr key={i} className="data-row">
                      <td className="px-4 py-3 text-ink-3 font-mono text-xs">{String(i+1).padStart(2,'0')}</td>
                      <td className="px-4 py-3 text-ink font-semibold">{row.entity}</td>
                      <td className="px-4 py-3 text-ink-2 text-right font-mono">{row.tender_count}</td>
                      <td className="px-4 py-3 text-forest text-right font-mono font-bold">{formatKES(row.total_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top suppliers */}
        {data.top_suppliers.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-forest mb-1">Top Suppliers</h2>
            <p className="text-ink-3 text-sm mb-4">Companies awarded the highest value contracts in {data.county} County</p>
            <div className="card-flat overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-2 border-b border-divider">
                    <th className="px-4 py-3 text-left text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3 text-right text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">Contracts</th>
                    <th className="px-4 py-3 text-right text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_suppliers.map((row, i) => (
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
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <Link href="/analytics" className="flex items-center gap-1.5 text-forest font-semibold text-sm hover:underline">
            ← All Counties
          </Link>
          <Link href={`/tenders?county=${encodeURIComponent(data.county)}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest text-white font-semibold text-sm rounded-lg hover:bg-forest-2 transition-colors">
            Browse {data.county} Tenders →
          </Link>
        </div>

      </div>
    </PageLayout>
  )
}
