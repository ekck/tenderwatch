'use client'
import { useState } from 'react'
import { subscribe } from '@/lib/api'

const CATEGORIES = ['works', 'goods', 'services']
const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Bomet', 'Eldoret', 'Kakamega', 'Machakos']

export default function AlertSignup() {
  const [email, setEmail] = useState('')
  const [keywords, setKeywords] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [counties, setCounties] = useState<string[]>([])
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [expanded, setExpanded] = useState(false)

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) =>
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await subscribe({ email, keywords: keywords.split(',').map(k=>k.trim()).filter(Boolean), categories, counties })
      setStatus('success')
    } catch { setStatus('error') }
  }

  if (status === 'success') return (
    <div className="py-4 text-center">
      <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2"><path d="M4 10l4 4 8-8"/></svg>
      </div>
      <p className="text-white font-semibold">Subscribed!</p>
      <p className="text-white/60 text-sm mt-1">We'll email you when matching tenders are published.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-gold backdrop-blur-sm" />
        <button type="submit" disabled={status==='loading'}
          className="px-5 py-3 bg-gold text-forest font-bold rounded-lg hover:bg-gold-2 transition-colors text-sm disabled:opacity-60 shadow-md">
          {status==='loading' ? '...' : 'Subscribe'}
        </button>
      </div>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="text-xs text-white/60 hover:text-gold transition-colors">
        {expanded ? '▲ Hide filters' : '▼ Add filters (optional)'}
      </button>
      {expanded && (
        <div className="space-y-3 text-left bg-white/5 rounded-lg p-4 border border-white/10">
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Keywords (comma-separated)</label>
            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)}
              placeholder="e.g. construction, medical, IT"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Categories</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggle(categories, cat, setCategories)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors font-medium ${categories.includes(cat) ? 'bg-gold text-forest border-gold' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Counties</label>
            <div className="flex gap-1.5 flex-wrap">
              {COUNTIES.map(county => (
                <button key={county} type="button" onClick={() => toggle(counties, county, setCounties)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${counties.includes(county) ? 'bg-gold text-forest border-gold' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`}>
                  {county}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {status==='error' && <p className="text-red-300 text-xs">Something went wrong. Please try again.</p>}
      <p className="text-white/40 text-xs">No spam. Unsubscribe anytime. See our <a href="/privacy" className="underline hover:text-white/60">Privacy Policy</a>.</p>
    </form>
  )
}
