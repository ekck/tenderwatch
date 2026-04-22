import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-forest text-white mt-16 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="6" width="14" height="10" rx="1.5" stroke="#1a4731" strokeWidth="1.5"/>
                  <path d="M5 6V5a4 4 0 018 0v1" stroke="#1a4731" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="11" r="1.5" fill="#1a4731"/>
                </svg>
              </div>
              <span className="font-display font-bold text-white text-lg">TenderWatch Kenya</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Kenya's independent public procurement tracker. Data sourced daily from the{' '}
              <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer"
                className="text-gold-2 hover:text-gold-3 underline transition-colors">
                Public Procurement Information Portal
              </a>.
            </p>
            <p className="text-white/40 text-xs mt-3">
              A <a href="https://zanah.co.ke" target="_blank" rel="noopener noreferrer"
                className="text-gold/60 hover:text-gold transition-colors">Zanah</a> project.
            </p>
          </div>

          <div>
            <h3 className="text-gold text-xs font-mono uppercase tracking-widest mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {[['Tenders','/tenders'],['Entities','/entities'],['Analytics','/analytics'],['About','/about'],['Contact','/contact']].map(([l,h]) => (
                <li key={h}><Link href={h} className="text-white/60 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold text-xs font-mono uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact Us','/contact']].map(([l,h]) => (
                <li key={h}><Link href={h} className="text-white/60 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/40 text-xs">
                Source:{' '}
                <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">PPRA Kenya</a>
                {' '}·{' '}
                <a href="https://data.open-contracting.org/en/publication/147" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">OCP Registry</a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} TenderWatch Kenya. Not affiliated with PPRA or the Government of Kenya.
          </p>
          <p className="text-white/30 text-xs">Procurement data updated daily.</p>
        </div>
      </div>
    </footer>
  )
}
