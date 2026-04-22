import { getEntity, formatKES, formatDate, statusClass, methodClass } from '@/lib/api'
import { InContentAd } from '@/components/ads/AdUnit'
import PageLayout from '@/components/layout/PageLayout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entity = await getEntity(Number(params.id)).catch(() => null)
  if (!entity) return { title: 'Entity Not Found' }
  return {
    title: entity.name,
    description: `Procurement history for ${entity.name}. ${entity.tender_count} tenders · ${entity.county || 'National'} · Total value: ${formatKES(entity.total_contract_value)}`,
  }
}

export default async function EntityDetailPage({ params }: Props) {
  const entity = await getEntity(Number(params.id)).catch(() => null)
  if (!entity) notFound()

  const typeColors: Record<string, string> = {
    national: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    county: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    parastatal: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  }

  return (
    <PageLayout leaderboardSlot="1010101010">
      <div>
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/entities" className="hover:text-slate-300">Entities</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px]">{entity.name}</span>
        </nav>

        <div className="flex items-start gap-3 mb-6 flex-wrap">
          <h1 className="font-display font-bold text-3xl text-white flex-1">{entity.name}</h1>
          {entity.entity_type && (
            <span className={`text-xs px-3 py-1 rounded border font-mono capitalize ${typeColors[entity.entity_type] || ''}`}>
              {entity.entity_type}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px bg-navy-700 rounded-lg overflow-hidden mb-8">
          {[
            { label: 'Total Tenders', value: entity.tender_count.toLocaleString() },
            { label: 'County / Region', value: entity.county || 'National' },
            { label: 'Total Contract Value', value: <span className="kes-value text-amber-400">{formatKES(entity.total_contract_value)}</span> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-950 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-white font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <InContentAd slot="1122334455" />

        {/* Recent tenders */}
        <div className="mt-6">
          <h2 className="font-display font-bold text-xl text-white mb-4">Recent Tenders</h2>
          {!entity.recent_tenders || entity.recent_tenders.length === 0 ? (
            <div className="py-10 text-center border border-navy-700 rounded-lg">
              <p className="text-slate-400 text-sm">No tenders recorded for this entity yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entity.recent_tenders.map((tender) => (
                <Link
                  key={tender.id}
                  href={`/tenders/${tender.id}`}
                  className="tender-card block p-4 border border-navy-700 rounded-lg bg-navy-950"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${statusClass(tender.status)}`}>
                          {tender.status}
                        </span>
                        {tender.procurement_method && (
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${methodClass(tender.procurement_method)}`}>
                            {tender.procurement_method}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white text-sm font-medium leading-snug">
                        {tender.title || 'Untitled Tender'}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Published {formatDate(tender.date_published)}
                        {tender.tender_period_end && ` · Closes ${formatDate(tender.tender_period_end)}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="kes-value text-amber-400 font-semibold text-sm">
                        {formatKES(tender.value_amount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Link
              href={`/tenders?entity=${entity.id}`}
              className="text-amber-400 text-sm hover:underline"
            >
              View all {entity.tender_count} tenders from this entity →
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-700">
          <Link href="/entities" className="text-slate-400 hover:text-white text-sm">
            ← Back to all entities
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
