import Link from 'next/link'
import { getTenders, formatKES, formatDate, statusClass, methodClass } from '@/lib/api'
import { RectangleAd } from '@/components/ads/AdUnit'
import PageLayout from '@/components/layout/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kenya Government Tenders',
  description: 'Browse and search all active Kenya government tenders. Filter by category, county, and procurement method.',
}

interface SearchParams { q?: string; category?: string; county?: string; method?: string; status?: string; page?: string }

export default async function TendersPage({ searchParams }: { searchParams: SearchParams }) {
  const params: Record<string,string> = { per_page: '20' }
  if (searchParams.q) params.q = searchParams.q
  if (searchParams.category) params.category = searchParams.category
  if (searchParams.county) params.county = searchParams.county
  if (searchParams.method) params.method = searchParams.method
  if (searchParams.status) params.status = searchParams.status
  if (searchParams.page) params.page = searchParams.page

  const { tenders, pagination } = await getTenders(params).catch(() => ({
    tenders: [], pagination: { page:1,pages:1,total:0,per_page:20,has_next:false,has_prev:false }
  }))

  const buildUrl = (overrides: Record<string,string>) =>
    '/tenders?' + new URLSearchParams({ ...searchParams as Record<string,string>, ...overrides }).toString()

  const hasFilters = searchParams.q || searchParams.status || searchParams.category || searchParams.method || searchParams.county

  return (
    <PageLayout leaderboardSlot="1111111111" fullWidth>
      <div>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-forest">Kenya Government Tenders</h1>
          <p className="text-muted text-sm mt-1 font-mono">
            {pagination.total.toLocaleString()} tenders · Updated daily from PPIP
          </p>
        </div>

        {/* Search bar */}
        <form method="GET" action="/tenders" className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input name="q" defaultValue={searchParams.q}
                placeholder="Search tenders by keyword..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-divider rounded-lg text-ink placeholder-muted-2 text-sm focus:outline-none focus:border-forest shadow-sm" />
            </div>
            <button type="submit"
              className="px-6 py-3 bg-forest text-white font-semibold rounded-lg hover:bg-forest-2 transition-colors text-sm shadow-sm">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { name:'status', label:'Status', opts:[['','All Status'],['active','Active'],['complete','Complete'],['cancelled','Cancelled']] },
              { name:'category', label:'Category', opts:[['','All Categories'],['works','Works'],['goods','Goods'],['services','Services']] },
              { name:'method', label:'Method', opts:[['','All Methods'],['open','Open'],['direct','Direct'],['restricted','Restricted']] },
            ].map(({ name, label, opts }) => (
              <select key={name} name={name}
                defaultValue={(searchParams as Record<string,string>)[name] || ''}
                className="px-3 py-2 bg-white border border-divider rounded-lg text-ink-3 text-sm focus:outline-none focus:border-forest shadow-sm cursor-pointer">
                {opts.map(([val,lbl]) => <option key={val} value={val}>{lbl}</option>)}
              </select>
            ))}
            {hasFilters && (
              <Link href="/tenders"
                className="px-3 py-2 text-sm text-muted hover:text-ink border border-divider rounded-lg bg-white hover:bg-cream transition-colors">
                Clear ✕
              </Link>
            )}
          </div>
        </form>

        <div className="flex gap-6">
          {/* Main list */}
          <div className="flex-1 min-w-0">
            {tenders.length === 0 ? (
              <div className="py-16 text-center card">
                <p className="text-muted text-lg mb-1">No tenders found</p>
                <p className="text-muted-2 text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tenders.map((tender, i) => (
                  <Link key={tender.id} href={`/tenders/${tender.id}`}
                    className="tender-card block p-4 animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${statusClass(tender.status)}`}>{tender.status}</span>
                          {tender.procurement_method && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${methodClass(tender.procurement_method)}`}>{tender.procurement_method}</span>
                          )}
                          {tender.category && (
                            <span className="text-xs px-2 py-0.5 bg-cream-2 text-ink-3 rounded-full border border-divider">{tender.category}</span>
                          )}
                        </div>
                        <h3 className="text-ink font-medium text-sm leading-snug mb-1.5">{tender.title || 'Untitled Tender'}</h3>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
                          {tender.entity && <span className="truncate max-w-[220px]">{tender.entity.name}</span>}
                          {tender.county && <span className="flex items-center gap-1">📍 {tender.county}</span>}
                          {tender.date_published && <span className="font-mono">· {formatDate(tender.date_published)}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="kes-value text-forest font-bold text-sm">{formatKES(tender.value_amount)}</p>
                        {tender.tender_period_end && (
                          <p className="text-muted text-xs mt-1 font-mono">Closes {formatDate(tender.tender_period_end)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-divider">
                <span className="text-muted text-sm">Page {pagination.page} of {pagination.pages}</span>
                <div className="flex gap-2">
                  {pagination.has_prev && (
                    <Link href={buildUrl({ page: String(pagination.page - 1) })}
                      className="px-4 py-2 text-sm border border-divider rounded-lg text-ink-3 hover:bg-cream bg-white shadow-sm">← Previous</Link>
                  )}
                  {pagination.has_next && (
                    <Link href={buildUrl({ page: String(pagination.page + 1) })}
                      className="px-4 py-2 text-sm bg-forest text-white rounded-lg hover:bg-forest-2 shadow-sm">Next →</Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 space-y-3">
              <RectangleAd slot="2222222222" />
              <div className="card-flat overflow-hidden">
                <div className="px-4 py-3 bg-forest">
                  <h3 className="text-white font-semibold text-sm">Quick Filters</h3>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-muted text-xs font-mono uppercase tracking-wider px-1 pb-1">By County</p>
                  {['Bomet','Nairobi','Mombasa','Kisumu','Nakuru','Eldoret'].map(county => (
                    <Link key={county} href={buildUrl({ county, page:'1' })}
                      className={`block px-3 py-2 text-xs rounded-lg transition-colors ${
                        searchParams.county === county ? 'bg-forest text-white font-medium' : 'text-ink-3 hover:bg-cream hover:text-forest'
                      }`}>
                      📍 {county} County
                    </Link>
                  ))}
                  <p className="text-muted text-xs font-mono uppercase tracking-wider px-1 pb-1 pt-2">By Category</p>
                  {['works','goods','services'].map(cat => (
                    <Link key={cat} href={buildUrl({ category: cat, page:'1' })}
                      className={`block px-3 py-2 text-xs rounded-lg capitalize transition-colors ${
                        searchParams.category === cat ? 'bg-forest text-white font-medium' : 'text-ink-3 hover:bg-cream hover:text-forest'
                      }`}>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}
