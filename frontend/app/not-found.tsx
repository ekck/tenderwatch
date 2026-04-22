import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-amber-500 text-6xl font-bold mb-4">404</p>
        <h1 className="font-display font-bold text-2xl text-white mb-3">Page not found</h1>
        <p className="text-slate-400 text-sm mb-6">
          This tender, entity, or page does not exist or has been removed.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 bg-amber-500 text-navy-900 font-semibold rounded hover:bg-amber-400 transition-colors text-sm">
            Go Home
          </Link>
          <Link href="/tenders" className="px-5 py-2.5 border border-navy-600 text-slate-300 rounded hover:bg-navy-700 transition-colors text-sm">
            Browse Tenders
          </Link>
        </div>
      </div>
    </div>
  )
}
