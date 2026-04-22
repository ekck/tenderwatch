'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const nav = [
  { label: 'Tenders', href: '/tenders' },
  { label: 'Entities', href: '/entities' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-divider shadow-panel">
      {/* Top strip */}
      <div className="bg-forest text-white px-4 py-1.5 flex items-center justify-between text-xs font-body">
        <span className="opacity-80">
          Data sourced from{' '}
          <a href="https://tenders.go.ke" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-gold-2 transition-colors">tenders.go.ke</a>
          {' '}· Updated daily
        </span>
        <span className="hidden sm:block opacity-70">Kenya Government Procurement {new Date().getFullYear()}</span>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center shadow-sm group-hover:bg-forest-2 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="6" width="14" height="10" rx="1.5" stroke="#c9a84c" strokeWidth="1.5"/>
              <path d="M5 6V5a4 4 0 018 0v1" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="11" r="1.5" fill="#c9a84c"/>
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-forest text-xl leading-none block">TenderWatch</span>
            <span className="text-[10px] text-gold font-mono tracking-[0.2em] leading-none block uppercase">Kenya</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ label, href }) => (
            <Link key={href} href={href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                path.startsWith(href)
                  ? 'text-forest bg-forest/8 font-semibold'
                  : 'text-ink-3 hover:text-forest hover:bg-cream'
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/tenders"
            className="px-5 py-2.5 text-sm font-semibold bg-forest text-white rounded-lg hover:bg-forest-2 transition-colors shadow-sm">
            Browse Tenders
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-ink-3 hover:text-forest rounded-lg hover:bg-cream transition-colors"
          onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open
              ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              : <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-divider bg-white px-4 py-3 space-y-1 shadow-panel">
          {nav.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 text-sm rounded-lg font-medium ${
                path.startsWith(href) ? 'text-forest bg-forest/8' : 'text-ink-3 hover:text-forest hover:bg-cream'
              }`}>
              {label}
            </Link>
          ))}
          <Link href="/tenders" onClick={() => setOpen(false)}
            className="block mt-2 px-3 py-2.5 text-sm font-semibold text-center bg-forest text-white rounded-lg">
            Browse Tenders
          </Link>
        </div>
      )}
    </header>
  )
}
