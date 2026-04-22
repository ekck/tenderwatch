import Link from 'next/link'
import { RectangleAd } from '@/components/ads/AdUnit'
import { getTenders, formatKES, formatDate } from '@/lib/api'

const ENTITY_SHORTCUTS = [
  { label: 'National Ministries', type: 'national', icon: '🏛️', color: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100' },
  { label: 'County Governments', type: 'county', icon: '📍', color: 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-100' },
  { label: 'Parastatals', type: 'parastatal', icon: '🏢', color: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100' },
]

const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Bomet', 'Eldoret', 'Meru', 'Nyeri']

export default async function Sidebar() {
  let latestTenders: Awaited<ReturnType<typeof getTenders>>['tenders'] = []

  try {
    const data = await getTenders({ per_page: 7, status: 'active' })
    latestTenders = data.tenders ?? []
  } catch {
    latestTenders = []
  }

  return (
    <aside className="w-[300px] space-y-4">

      {/* Top ad */}
      <RectangleAd slot="1122334455" />

      {/* Entity shortcuts */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 bg-forest">
          <h3 className="text-white font-semibold text-sm">Browse by Entity Type</h3>
        </div>
        <div className="p-3 space-y-2">
          {ENTITY_SHORTCUTS.map(({ label, type, icon, color }) => (
            <Link key={type} href={`/entities?type=${type}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${color} group`}>
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium flex-1">{label}</span>
              <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          ))}
        </div>
        <div className="px-4 pb-4 pt-1 border-t border-divider">
          <p className="text-muted text-xs font-mono uppercase tracking-wider mb-2 mt-2">Filter by county</p>
          <div className="flex flex-wrap gap-1.5">
            {COUNTIES.map(county => (
              <Link key={county} href={`/tenders?county=${county}`}
                className="px-2.5 py-1 text-xs bg-cream-2 text-ink-3 rounded-full hover:bg-forest hover:text-white transition-colors border border-divider font-medium">
                {county}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest tenders */}
      <div className="card-flat overflow-hidden">
        <div className="px-4 py-3 bg-forest flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Latest Active Tenders</h3>
          <Link href="/tenders" className="text-gold-2 text-xs hover:text-gold-3 transition-colors font-medium">All →</Link>
        </div>

        {latestTenders.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-muted text-xs">No active tenders loaded yet.</p>
            <p className="text-muted-2 text-xs mt-1">
              Run <code className="bg-cream-2 px-1 py-0.5 rounded font-mono text-xs">make sync</code> to pull data.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {latestTenders.map((tender, i) => (
              <Link key={tender.id} href={`/tenders/${tender.id}`}
                className="block px-4 py-3 hover:bg-cream-2 transition-colors group animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}>
                <p className="text-ink-2 text-xs font-semibold leading-snug line-clamp-2 group-hover:text-forest mb-1.5 transition-colors">
                  {tender.title || 'Untitled Tender'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="kes-value text-forest font-bold text-xs">{formatKES(tender.value_amount)}</span>
                  {tender.county && <span className="text-muted text-xs">📍 {tender.county}</span>}
                </div>
                {tender.tender_period_end && (
                  <p className="text-muted text-xs mt-1 font-mono">Closes {formatDate(tender.tender_period_end)}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="px-4 py-3 bg-cream-2 border-t border-divider">
          <Link href="/tenders"
            className="block text-center text-xs text-forest font-semibold hover:underline">
            Browse all active tenders →
          </Link>
        </div>
      </div>

      {/* Bottom ad */}
      <RectangleAd slot="5566778899" />
    </aside>
  )
}
