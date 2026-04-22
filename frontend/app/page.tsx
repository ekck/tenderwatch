import Link from 'next/link'
import {
  getTenders, getAnalyticsSummary, getByCounty, getByCategory,
  getTopEntities, formatKES, formatDate, statusClass, methodClass, resolveStatus
} from '@/lib/api'
import { LeaderboardAd, InContentAd } from '@/components/ads/AdUnit'
import AlertSignup from '@/components/ui/AlertSignup'

export const metadata = {
  title: 'TenderWatch Kenya — Public Procurement Tracker',
  description: 'Track Kenya government tenders, contract awards and procurement spending from all ministries and county governments. Free, daily-updated data from PPIP.',
}

export default async function HomePage() {
  const [tendersData, highValueData, summary, countyData, categoryData, topEntData] = await Promise.allSettled([
    getTenders({ per_page: 8, status: 'active' }),
    getTenders({ per_page: 4, status: 'active' }),
    getAnalyticsSummary(),
    getByCounty(),
    getByCategory(),
    getTopEntities(6),
  ])

  const tenders     = tendersData.status   === 'fulfilled' ? tendersData.value.tenders   : []
  const stats       = summary.status       === 'fulfilled' ? summary.value               : null
  const counties    = countyData.status    === 'fulfilled' ? countyData.value.slice(0,6) : []
  const categories  = categoryData.status  === 'fulfilled' ? categoryData.value          : []
  const topEntities = topEntData.status    === 'fulfilled' ? topEntData.value            : []

  // Recently closed tenders
  const [closedData] = await Promise.allSettled([getTenders({ per_page: 4, status: 'complete' })])
  const closedTenders = closedData.status === 'fulfilled' ? closedData.value.tenders : []

  const totalCountySpend = counties.reduce((s, c) => s + c.total_value, 0)

  return (
    <div className="bg-cream">
      <LeaderboardAd slot="1234567890" />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-forest">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #c9a84c 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-forest to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-gold-2 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-2 animate-pulse" />
              LIVE · Updated daily from tenders.go.ke
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-6xl text-white leading-[1.05] mb-6">
              Kenya Government<br />
              <span className="text-gold">Procurement</span><br />
              Made Transparent.
            </h1>
            <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              TenderWatch aggregates every public tender and contract award from Kenya's PPIP portal — covering all ministries, parastatals, and county governments in one searchable platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tenders" className="px-6 py-3 bg-gold text-forest font-bold rounded-lg hover:bg-gold-2 transition-colors shadow-md">
                Browse Active Tenders
              </Link>
              <Link href="/analytics" className="px-6 py-3 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors">
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {stats && (
        <section className="bg-white border-b border-divider shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-divider">
            {[
              { label: 'Total Tenders', value: stats.total_tenders.toLocaleString(), icon: '📄', sub: 'since 2018' },
              { label: 'Contract Awards', value: stats.total_awards.toLocaleString(), icon: '🏆', sub: 'recorded' },
              { label: 'Procuring Entities', value: stats.total_entities.toLocaleString(), icon: '🏛️', sub: 'active entities' },
              { label: 'Direct Procurement', value: `${stats.direct_procurement_pct}%`, icon: stats.direct_procurement_pct > 25 ? '⚠️' : '✅', alert: stats.direct_procurement_pct > 25, sub: 'of all tenders' },
            ].map(({ label, value, icon, alert, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 sm:px-6 first:pl-0 last:pr-0 py-1">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className={`kes-value text-2xl font-bold ${alert ? 'text-red-600' : 'text-forest'}`}>{value}</p>
                  <p className="text-ink-3 text-xs font-semibold">{label}</p>
                  <p className="text-muted text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ad after stats ── */}
      <div className="bg-cream-2 border-b border-divider flex justify-center py-3">
        <InContentAd slot="0987654321" />
      </div>

      {/* ── Latest active tenders ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-3xl text-forest">Latest Active Tenders</h2>
            <p className="text-ink-3 text-sm mt-1">Open procurement opportunities across Kenya — closing soon</p>
          </div>
          <Link href="/tenders" className="hidden sm:inline-flex items-center gap-1 text-forest font-semibold text-sm hover:underline">
            Browse all <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {tenders.length === 0 ? (
            <div className="col-span-2 py-16 text-center card">
              <p className="text-ink-2 font-semibold text-lg mb-2">No tenders loaded yet</p>
              <p className="text-ink-3 text-sm">Run <code className="bg-cream-2 px-1.5 py-0.5 rounded font-mono text-xs">make sync</code> to pull live data from PPIP</p>
            </div>
          ) : tenders.map((tender, i) => (
            <Link key={tender.id} href={`/tenders/${tender.id}`}
              className="tender-card block p-5 animate-fade-in"
              style={{ animationDelay: `${i * 45}ms` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-ink font-bold text-sm leading-snug line-clamp-2 flex-1">
                  {tender.title || 'Untitled Tender'}
                </h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${statusClass(resolveStatus(tender.status, tender.tender_period_end))}`}>
                  {resolveStatus(tender.status, tender.tender_period_end)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="kes-value text-forest text-base font-bold">{formatKES(tender.value_amount)}</span>
                {tender.procurement_method && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${methodClass(tender.procurement_method)}`}>
                    {tender.procurement_method}
                  </span>
                )}
                {tender.county && (
                  <span className="text-xs px-2 py-0.5 bg-cream-2 text-ink-3 rounded-full border border-divider">📍 {tender.county}</span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-divider pt-2">
                <p className="text-ink-3 text-xs truncate max-w-[60%]">{tender.entity?.name ?? '—'}</p>
                {tender.tender_period_end && (
                  <p className="text-muted text-xs font-mono shrink-0">Closes {formatDate(tender.tender_period_end)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center sm:hidden">
          <Link href="/tenders" className="text-forest font-semibold text-sm hover:underline">View all tenders →</Link>
        </div>
      </section>

      {/* ── Browse by category ── */}
      {categories.length > 0 && (
        <section className="bg-white border-y border-divider">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-forest">Browse by Category</h2>
                <p className="text-ink-3 text-sm mt-1">Tenders grouped by procurement category</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'works',    label: 'Works',    icon: '🏗️', desc: 'Construction, roads, infrastructure', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
                { key: 'goods',    label: 'Goods',    icon: '📦', desc: 'Equipment, supplies, materials',       color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
                { key: 'services', label: 'Services', icon: '🛎️', desc: 'Consultancy, IT, security, cleaning',  color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
              ].map(({ key, label, icon, desc, color }) => {
                const catData = categories.find(c => c.category?.toLowerCase() === key)
                return (
                  <Link key={key} href={`/tenders?category=${key}`}
                    className={`card p-6 flex flex-col gap-3 border-2 transition-all group ${color}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h3 className="text-ink font-bold text-lg">{label}</h3>
                        <p className="text-ink-3 text-xs">{desc}</p>
                      </div>
                    </div>
                    {catData && (
                      <div className="pt-3 border-t border-divider grid grid-cols-2 gap-2">
                        <div>
                          <p className="kes-value text-forest font-bold text-sm">{catData.count.toLocaleString()}</p>
                          <p className="text-muted text-xs">tenders</p>
                        </div>
                        <div>
                          <p className="kes-value text-forest font-bold text-sm">{formatKES(catData.total_value)}</p>
                          <p className="text-muted text-xs">total value</p>
                        </div>
                      </div>
                    )}
                    <span className="text-forest text-xs font-semibold group-hover:underline mt-auto">
                      Browse {label} tenders →
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── County spend map ── */}
      {counties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-forest">Procurement by County</h2>
              <p className="text-ink-3 text-sm mt-1">Top counties by number of active tenders</p>
            </div>
            <Link href="/analytics" className="hidden sm:inline-flex text-forest text-sm font-semibold hover:underline">
              Full analytics →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {counties.map((county, i) => {
              const pct = totalCountySpend > 0 ? Math.round((county.total_value / totalCountySpend) * 100) : 0
              const barW = Math.max(10, Math.round((county.tender_count / (counties[0]?.tender_count || 1)) * 100))
              return (
                <Link key={county.county} href={`/tenders?county=${county.county}`}
                  className="card p-4 flex flex-col gap-2 hover:border-forest group animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between">
                    <span className="text-ink font-bold text-sm group-hover:text-forest transition-colors">
                      {county.county}
                    </span>
                    <span className="text-xs font-mono font-semibold text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                      {county.tender_count}
                    </span>
                  </div>
                  <div className="w-full bg-cream-3 rounded-full h-1.5">
                    <div className="bg-forest h-1.5 rounded-full transition-all" style={{ width: `${barW}%` }} />
                  </div>
                  <p className="text-muted text-xs font-mono">{formatKES(county.total_value)}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Ad strip ── */}
      <div className="bg-cream-2 border-y border-divider flex justify-center py-3">
        <InContentAd slot="1357924680" />
      </div>

      {/* ── Top spending entities ── */}
      {topEntities.length > 0 && (
        <section className="bg-white border-b border-divider">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-forest">Top Spending Entities</h2>
                <p className="text-ink-3 text-sm mt-1">Government bodies with the highest procurement volume</p>
              </div>
              <Link href="/entities" className="hidden sm:inline-flex text-forest text-sm font-semibold hover:underline">
                All entities →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topEntities.map((ent, i) => (
                <Link key={i} href={`/entities`}
                  className="card p-4 flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 55}ms` }}>
                  <div className="w-9 h-9 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center shrink-0 text-lg">
                    {ent.county ? '📍' : '🏛️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-ink font-bold text-sm leading-snug line-clamp-2 mb-1">{ent.entity}</h3>
                    <p className="text-muted text-xs">{ent.county ? `${ent.county} County` : 'National Government'}</p>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-divider">
                      <span className="kes-value text-forest font-bold text-xs">{formatKES(ent.total_value)}</span>
                      <span className="text-muted text-xs">· {ent.tender_count} tenders</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently closed tenders ── */}
      {closedTenders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-forest">Recently Closed Tenders</h2>
              <p className="text-ink-3 text-sm mt-1">Awards and completed procurement processes</p>
            </div>
            <Link href="/tenders?status=complete" className="hidden sm:inline-flex text-forest text-sm font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="card-flat overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-2 border-b border-divider">
                  <th className="px-4 py-3 text-left text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">Tender</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider hidden sm:table-cell">Entity</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-ink-3 font-semibold uppercase tracking-wider hidden md:table-cell">Closed</th>
                </tr>
              </thead>
              <tbody>
                {closedTenders.map(t => (
                  <tr key={t.id} className="data-row">
                    <td className="px-4 py-3">
                      <Link href={`/tenders/${t.id}`} className="text-ink font-semibold text-sm hover:text-forest line-clamp-1 transition-colors">
                        {t.title || 'Untitled'}
                      </Link>
                      {t.county && <p className="text-muted text-xs mt-0.5">📍 {t.county}</p>}
                    </td>
                    <td className="px-4 py-3 text-ink-3 text-xs hidden sm:table-cell max-w-[160px]">
                      <span className="line-clamp-2">{t.entity?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="kes-value text-forest font-bold text-sm">{formatKES(t.value_amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-ink-3 text-xs font-mono hidden md:table-cell">
                      {formatDate(t.tender_period_end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Why TenderWatch ── */}
      <section className="bg-white border-y border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-forest mb-2">Why TenderWatch?</h2>
            <p className="text-ink-3 text-base max-w-2xl mx-auto">
              Kenya's procurement data is public — but it's scattered, hard to search, and presented in formats that require specialist knowledge to interpret. TenderWatch changes that.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'Instant Search', desc: 'Search 8,000+ tenders in seconds by keyword, county, category, or value — no government portal login required.' },
              { icon: '🔔', title: 'Smart Alerts', desc: 'Subscribe to daily email alerts. Get notified the moment a tender matching your criteria is published — never miss a deadline.' },
              { icon: '📊', title: 'Spending Insights', desc: 'Interactive charts reveal how public money flows — by county, ministry, category, and procurement method.' },
              { icon: '🏛️', title: 'Entity Profiles', desc: 'Explore full procurement histories for every ministry, county government, parastatal, and public school in Kenya.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <h3 className="text-ink font-bold text-base">{title}</h3>
                <p className="text-ink-3 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who uses TenderWatch ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-forest mb-2">Who Uses TenderWatch?</h2>
          <p className="text-ink-3 text-sm">Serving everyone with an interest in Kenya's public procurement</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🏢', audience: 'SMEs & Suppliers', points: ['Find tenders in your sector', 'Filter by county or value', 'Set deadline alerts', 'Track competitor awards'] },
            { icon: '📰', audience: 'Journalists & CSOs', points: ['Monitor direct procurement', 'Track entity spending', 'Identify anomalies', 'Export data for analysis'] },
            { icon: '🏛️', audience: 'Procurement Officers', points: ['Benchmark your entity', 'Check compliance visibility', 'Track award patterns', 'Verify public records'] },
            { icon: '🎓', audience: 'Researchers & Students', points: ['Access structured OCDS data', 'Study spending patterns', 'Analyse county budgets', 'Track policy impact'] },
          ].map(({ icon, audience, points }) => (
            <div key={audience} className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-ink font-bold text-sm">{audience}</h3>
              </div>
              <ul className="space-y-2">
                {points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-xs text-ink-3">
                    <span className="text-forest font-bold mt-0.5">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-cream-2 border-y border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-forest mb-2">How TenderWatch Works</h2>
            <p className="text-ink-3 text-sm">Simple, transparent, powered by open government data</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {[
              { step: '1', title: 'PPIP Publishes', desc: 'Kenya\'s PPRA requires all government entities to upload tenders and awards to the Public Procurement Information Portal.' },
              { step: '2', title: 'We Sync Daily', desc: 'Every morning at 6 AM EAT, TenderWatch fetches the latest OCDS data feed and updates our database.' },
              { step: '3', title: 'You Search & Track', desc: 'Search, filter, and browse tenders. Set email alerts for categories and counties that matter to you.' },
              { step: '4', title: 'Win More Contracts', desc: 'Submit bids directly on tenders.go.ke — TenderWatch links to every official tender page.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-forest text-white font-display font-bold text-xl flex items-center justify-center shadow-md">
                  {step}
                </div>
                {i < 3 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 bg-divider" />
                )}
                <h3 className="text-ink font-bold text-sm">{title}</h3>
                <p className="text-ink-3 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alert signup ── */}
      <section className="bg-forest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #c9a84c 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔔</span>
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-3">Never Miss a Tender</h2>
            <p className="text-white/75 text-base mb-6 leading-relaxed">
              Get daily email alerts for new tenders matching your keywords, category, or county. Free forever. No spam, unsubscribe anytime.
            </p>
            <AlertSignup />
          </div>
        </div>
      </section>

      {/* ── Data source note ── */}
      <section className="bg-cream-2 border-t border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-ink font-bold text-sm mb-1">About Our Data</p>
              <p className="text-ink-3 text-xs leading-relaxed max-w-2xl">
                All procurement data is sourced from the{' '}
                <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="text-forest font-semibold hover:underline">
                  Kenya Public Procurement Information Portal (PPIP)
                </a>
                {' '}via the Open Contracting Data Standard (OCDS) feed, maintained by PPRA. TenderWatch is an independent transparency platform — not affiliated with PPRA or the Government of Kenya.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold bg-white border border-divider rounded-lg text-ink-2 hover:border-forest hover:text-forest transition-colors">
                tenders.go.ke ↗
              </a>
              <a href="https://ppra.go.ke" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold bg-white border border-divider rounded-lg text-ink-2 hover:border-forest hover:text-forest transition-colors">
                ppra.go.ke ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
