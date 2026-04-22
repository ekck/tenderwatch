import { getEntities } from '@/lib/api'
import PageLayout from '@/components/layout/PageLayout'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Procuring Entities — Kenya Government',
  description: 'Browse all Kenya government procuring entities — ministries, county governments, and parastatals — and their full procurement history.',
}

interface SearchParams { county?: string; type?: string; page?: string }

function getEntityCategory(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('ministry') || n.includes('state department') || n.includes('office of')) return 'Ministry / State Dept'
  if (n.includes('university') || n.includes('college') || n.includes('polytechnic') || n.includes('institute of technology')) return 'University / College'
  if (n.includes('secondary school') || n.includes('high school') || n.includes('primary school')) return 'Public School'
  if (n.includes('hospital') || n.includes('health centre') || n.includes('dispensary')) return 'Health Facility'
  if (n.includes('authority')) return 'Regulatory Authority'
  if (n.includes('commission')) return 'Commission'
  if (n.includes('board')) return 'Board / Council'
  if (n.includes('corporation') || n.includes('company')) return 'State Corporation'
  if (n.includes('agency') || n.includes('bureau') || n.includes('directorate')) return 'Government Agency'
  if (n.includes('service') && (n.includes('kenya') || n.includes('national'))) return 'National Service'
  if (n.includes('fund') || n.includes('trust')) return 'Fund / Trust'
  if (n.includes('kenya') && (n.includes('power') || n.includes('railway') || n.includes('ports') || n.includes('pipeline') || n.includes('airports'))) return 'Infrastructure SOE'
  if (n.includes('county') && n.includes('government')) return 'County Government'
  return 'National Entity'
}

export default async function EntitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const currentPage = Number(searchParams.page || 1)
  const params: Record<string, string> = { per_page: '30', page: String(currentPage) }
  if (searchParams.county) params.county = searchParams.county
  if (searchParams.type) params.type = searchParams.type

  const { entities, pagination } = await getEntities(params).catch(() => ({
    entities: [],
    pagination: { page: 1, pages: 1, total: 0, per_page: 30, has_next: false, has_prev: false }
  }))

  const buildUrl = (overrides: Record<string, string>) =>
    '/entities?' + new URLSearchParams({ ...searchParams as Record<string,string>, ...overrides }).toString()

  // Build page number array for pagination
  const totalPages = pagination.pages
  const getPageNums = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const typeConfig: Record<string, { label: string; badgeBg: string; badgeText: string; icon: string }> = {
    national:   { label: 'National', badgeBg: 'bg-blue-50',   badgeText: 'text-blue-800',   icon: '🏛️' },
    county:     { label: 'County',   badgeBg: 'bg-green-50',  badgeText: 'text-green-800',  icon: '📍' },
    parastatal: { label: 'Parastatal', badgeBg: 'bg-purple-50', badgeText: 'text-purple-800', icon: '🏢' },
  }

  return (
    <PageLayout leaderboardSlot="8888888888">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-forest">Procuring Entities</h1>
          <p className="text-ink-3 text-sm mt-1">
            <span className="font-mono font-semibold">{pagination.total.toLocaleString()}</span> entities across ministries, county governments, parastatals and schools
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'All Entities', val: '', icon: '🔍' },
            { label: 'National', val: 'national', icon: '🏛️' },
            { label: 'County', val: 'county', icon: '📍' },
            { label: 'Parastatal', val: 'parastatal', icon: '🏢' },
          ].map(({ label, val, icon }) => {
            const active = (searchParams.type || '') === val
            return (
              <Link key={val} href={buildUrl({ type: val, page: '1' })}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border font-semibold transition-all ${
                  active
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-white text-ink-2 border-divider hover:border-forest hover:text-forest'
                }`}>
                <span>{icon}</span> {label}
              </Link>
            )
          })}
        </div>

        {/* Grid */}
        {entities.length === 0 ? (
          <div className="py-16 text-center card">
            <p className="text-ink-2 text-lg font-semibold">No entities found</p>
            <p className="text-ink-3 text-sm mt-1">Try a different filter or run a sync</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entities.map((entity) => {
              const cfg = typeConfig[entity.entity_type] ?? { label: entity.entity_type, badgeBg: 'bg-cream-2', badgeText: 'text-ink-3', icon: '🏛️' }
              const category = getEntityCategory(entity.name)

              return (
                <Link key={entity.id} href={`/entities/${entity.id}`} className="tender-card block p-4">
                  {/* Top row — name + badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{cfg.icon}</span>
                      <h3 className="text-ink font-bold text-sm leading-snug">{entity.name}</h3>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-mono font-semibold border ${cfg.badgeBg} ${cfg.badgeText} border-current/20`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Sub-line — category for national, county for county */}
                  <p className="text-ink-3 text-xs ml-7 mb-3">
                    {entity.entity_type === 'national'
                      ? category
                      : entity.county
                        ? `${entity.county} County`
                        : cfg.label}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-2 border-t border-divider ml-7">
                    <span className="text-muted text-xs">Procurement history</span>
                    <span className="text-forest font-bold text-sm font-mono">{entity.tender_count.toLocaleString()} tenders →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Improved pagination ── */}
        {totalPages > 1 && (
          <div className="mt-8 pt-5 border-t border-divider">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Info */}
              <p className="text-ink-3 text-sm">
                Showing <span className="font-semibold text-ink">{((currentPage - 1) * 30) + 1}–{Math.min(currentPage * 30, pagination.total)}</span>
                {' '}of <span className="font-semibold text-ink">{pagination.total.toLocaleString()}</span> entities
              </p>

              {/* Page buttons */}
              <div className="flex items-center gap-1">
                {/* Prev */}
                <Link href={buildUrl({ page: String(currentPage - 1) })}
                  aria-disabled={!pagination.has_prev}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    pagination.has_prev
                      ? 'bg-white text-ink-2 border-divider hover:border-forest hover:text-forest'
                      : 'bg-cream-2 text-muted border-divider cursor-not-allowed pointer-events-none'
                  }`}>
                  ← Prev
                </Link>

                {/* Numbered pages */}
                <div className="flex items-center gap-1">
                  {getPageNums().map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="px-2 py-2 text-muted text-sm">…</span>
                    ) : (
                      <Link key={p} href={buildUrl({ page: String(p) })}
                        className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border font-semibold transition-colors ${
                          p === currentPage
                            ? 'bg-forest text-white border-forest shadow-sm'
                            : 'bg-white text-ink-2 border-divider hover:border-forest hover:text-forest'
                        }`}>
                        {p}
                      </Link>
                    )
                  )}
                </div>

                {/* Next */}
                <Link href={buildUrl({ page: String(currentPage + 1) })}
                  aria-disabled={!pagination.has_next}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    pagination.has_next
                      ? 'bg-forest text-white border-forest hover:bg-forest-2'
                      : 'bg-cream-2 text-muted border-divider cursor-not-allowed pointer-events-none'
                  }`}>
                  Next →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  )
}
