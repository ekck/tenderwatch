import { getTender, formatKES, formatDate, statusClass, methodClass } from '@/lib/api'
import { InContentAd } from '@/components/ads/AdUnit'
import PageLayout from '@/components/layout/PageLayout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tender = await getTender(Number(params.id)).catch(() => null)
  if (!tender) return { title: 'Tender Not Found' }
  return {
    title: tender.title || 'Tender Details',
    description: `${tender.entity?.name || 'Government entity'} — ${formatKES(tender.value_amount)} · ${tender.category} · Kenya`,
  }
}

export default async function TenderDetailPage({ params }: Props) {
  const tender = await getTender(Number(params.id)).catch(() => null)
  if (!tender) notFound()

  // Build direct link to the actual tender on tenders.go.ke using the OCID
  const ppipUrl = tender.ocid
    ? `https://tenders.go.ke/website/tenders/view/${tender.ocid}`
    : 'https://tenders.go.ke'

  const isOpen = tender.status === 'active' &&
    tender.tender_period_end &&
    new Date(tender.tender_period_end) > new Date()

  const daysLeft = tender.tender_period_end
    ? Math.ceil((new Date(tender.tender_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <PageLayout leaderboardSlot="3333333333">
      <div>
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-forest transition-colors">Home</Link>
          <span className="text-muted-2">/</span>
          <Link href="/tenders" className="hover:text-forest transition-colors">Tenders</Link>
          <span className="text-muted-2">/</span>
          <span className="text-ink-3 truncate max-w-[200px]">{tender.title || 'Tender'}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${statusClass(tender.status)}`}>
                {tender.status?.toUpperCase()}
              </span>
              {tender.procurement_method && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono ${methodClass(tender.procurement_method)}`}>
                  {tender.procurement_method}
                </span>
              )}
              {tender.category && (
                <span className="text-xs px-2.5 py-1 bg-cream-2 text-ink-3 rounded-full border border-divider">
                  {tender.category}
                </span>
              )}
              {isOpen && daysLeft !== null && daysLeft >= 0 && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold ${
                  daysLeft <= 7 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {daysLeft === 0 ? 'Closes today' : `${daysLeft}d remaining`}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-snug mb-2">
                {tender.title || 'Untitled Tender'}
              </h1>
              {tender.entity && (
                <p className="text-muted text-sm">
                  Issued by <span className="text-forest font-medium">{tender.entity.name}</span>
                </p>
              )}
            </div>

            {/* Key details grid */}
            <div className="card-flat overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-divider">
                {[
                  { label: 'Contract Value', value: <span className="kes-value text-forest font-bold text-lg">{formatKES(tender.value_amount)}</span> },
                  { label: 'County / Region', value: <span className="text-ink font-medium">{tender.county || 'National'}</span> },
                  { label: 'Date Published', value: <span className="text-ink font-mono text-sm">{formatDate(tender.date_published)}</span> },
                  { label: 'Closing Date', value: (
                    <span className={`font-mono text-sm font-semibold ${!tender.tender_period_end ? 'text-muted' : daysLeft !== null && daysLeft <= 7 && isOpen ? 'text-red-600' : 'text-ink'}`}>
                      {formatDate(tender.tender_period_end)}
                      {isOpen && daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
                        <span className="text-red-500 text-xs ml-1">(urgent)</span>
                      )}
                    </span>
                  )},
                  { label: 'Currency', value: <span className="text-ink font-mono">{tender.value_currency || 'KES'}</span> },
                  { label: 'OCID Reference', value: <span className="font-mono text-xs text-ink-3 break-all">{tender.ocid}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-4">
                    <p className="text-muted text-xs uppercase tracking-wider font-mono mb-1">{label}</p>
                    <div className="text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {tender.description && (
              <div className="card-flat p-5">
                <h2 className="font-display font-bold text-lg text-forest mb-3">Description</h2>
                <p className="text-ink-3 leading-relaxed text-sm">{tender.description}</p>
              </div>
            )}

            <InContentAd slot="4444444444" />

            {/* Award */}
            {tender.award ? (
              <div className="card-flat overflow-hidden">
                <div className="bg-forest px-5 py-3">
                  <h2 className="font-display font-bold text-white text-lg">Contract Award</h2>
                </div>
                <div className="grid grid-cols-2 gap-px bg-divider">
                  {[
                    { label: 'Awarded To', value: <span className="text-ink font-semibold">{tender.award.supplier?.name || '—'}</span> },
                    { label: 'Award Value', value: <span className="kes-value text-forest font-bold">{formatKES(tender.award.value_amount)}</span> },
                    { label: 'Date Awarded', value: <span className="text-ink font-mono text-sm">{formatDate(tender.award.date_awarded)}</span> },
                    { label: 'Award Status', value: <span className="badge-active text-xs px-2 py-0.5 rounded-full font-mono">{tender.award.status}</span> },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white p-4">
                      <p className="text-muted text-xs uppercase tracking-wider font-mono mb-1">{label}</p>
                      <div className="text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card-flat p-5 text-center border-2 border-dashed border-divider bg-cream">
                <p className="text-ink-3 text-sm font-medium">No contract award recorded yet</p>
                <p className="text-muted text-xs mt-1">Awards are published after tender evaluation is complete.</p>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            {/* Direct PPIP link */}
            <div className="card-flat overflow-hidden">
              <div className="bg-forest px-4 py-3">
                <h3 className="text-white font-semibold text-sm">View Official Tender</h3>
              </div>
              <div className="p-4">
                <p className="text-ink-3 text-xs leading-relaxed mb-3">
                  View the full official tender notice, downloadable documents, and any amendments directly on the PPIP portal.
                </p>
                <a href={ppipUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-forest text-white text-sm font-semibold rounded-lg hover:bg-forest-2 transition-colors shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                  View on tenders.go.ke ↗
                </a>
                <p className="text-muted text-xs mt-2 text-center">Opens official government portal</p>
              </div>
            </div>

            {/* Procuring entity */}
            {tender.entity && (
              <div className="card-flat overflow-hidden">
                <div className="bg-cream-2 px-4 py-3 border-b border-divider">
                  <h3 className="text-ink-2 font-semibold text-sm">Procuring Entity</h3>
                </div>
                <div className="p-4">
                  <p className="text-ink font-semibold text-sm mb-1">{tender.entity.name}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {tender.entity.county && (
                      <span className="text-xs text-muted">📍 {tender.entity.county} County</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono capitalize ${
                      tender.entity.entity_type === 'county' ? 'bg-green-50 text-green-700 border border-green-200' :
                      tender.entity.entity_type === 'national' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>{tender.entity.entity_type}</span>
                  </div>
                  <Link href={`/entities/${tender.entity.id}`}
                    className="block text-center py-2 text-xs border-2 border-forest text-forest font-semibold rounded-lg hover:bg-forest hover:text-white transition-colors">
                    View all {tender.entity.tender_count} tenders →
                  </Link>
                </div>
              </div>
            )}

            {/* Deadline urgency */}
            {tender.tender_period_end && (
              <div className={`card-flat p-4 ${isOpen && daysLeft !== null && daysLeft <= 14 ? 'border-2 border-red-200 bg-red-50' : 'bg-gold-light border border-gold/30'}`}>
                <h3 className={`font-semibold text-sm mb-1 ${isOpen && daysLeft !== null && daysLeft <= 14 ? 'text-red-700' : 'text-amber-800'}`}>
                  {isOpen ? '⏰ Submission Deadline' : '📅 Closing Date'}
                </h3>
                <p className={`font-mono font-bold text-lg ${isOpen && daysLeft !== null && daysLeft <= 14 ? 'text-red-600' : 'text-amber-700'}`}>
                  {formatDate(tender.tender_period_end)}
                </p>
                {isOpen && daysLeft !== null && (
                  <p className={`text-xs mt-1 ${daysLeft <= 7 ? 'text-red-600 font-semibold' : 'text-amber-700'}`}>
                    {daysLeft === 0 ? '⚠️ Closes today' : daysLeft < 0 ? 'Closed' : `${daysLeft} days remaining`}
                  </p>
                )}
                {!isOpen && <p className="text-muted text-xs mt-1">This tender is no longer accepting submissions.</p>}
              </div>
            )}

            {/* Alert CTA */}
            <div className="card-flat p-4 bg-forest text-white">
              <p className="font-semibold text-sm mb-1">🔔 Get Similar Alerts</p>
              <p className="text-white/70 text-xs mb-3">
                Be notified when similar {tender.category || ''} tenders are published.
              </p>
              <Link href="/#alerts"
                className="block text-center py-2 text-xs bg-gold text-forest font-bold rounded-lg hover:bg-gold-2 transition-colors">
                Set Up Free Alerts
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 pt-6 border-t border-divider">
          <Link href="/tenders" className="text-forest hover:underline text-sm flex items-center gap-1.5 font-medium">
            ← Back to all tenders
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
