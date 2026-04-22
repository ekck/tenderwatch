'use client'
import { useEffect, useRef } from 'react'

// ─── Slot registry ────────────────────────────────────────────────────────────
// Each key maps to one ad placement. Iframe slots use HighPerformanceFormat;
// native-banner uses Adsterra via profitablecpmratenetwork.
const SLOTS = {
  '300x250': {
    kind: 'hpf-iframe' as const,
    key: '6d18e223fdb9521da5d286822dba77a6',
    width: 300,
    height: 250,
    src: 'https://www.highperformanceformat.com/6d18e223fdb9521da5d286822dba77a6/invoke.js',
  },
  '728x90': {
    kind: 'hpf-iframe' as const,
    key: 'c8aaa9407a566b1bd7b671f1b1951f15',
    width: 728,
    height: 90,
    src: 'https://www.highperformanceformat.com/c8aaa9407a566b1bd7b671f1b1951f15/invoke.js',
  },
  'native-banner': {
    kind: 'adsterra-native' as const,
    containerId: 'container-5a3f4fe67d0ded4ab82b9d250a736411',
    src: 'https://pl29214641.profitablecpmratenetwork.com/5a3f4fe67d0ded4ab82b9d250a736411/invoke.js',
  },
} as const

export type AdSlotId = keyof typeof SLOTS

// ─── AdSlot ───────────────────────────────────────────────────────────────────
// Renders one ad placement. Dynamically injects the required scripts into its
// own container div so multiple instances on the same page are isolated.
export function AdSlot({ slot, className = '' }: { slot: AdSlotId; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)
  const cfg = SLOTS[slot]

  useEffect(() => {
    if (!ref.current || loaded.current) return
    loaded.current = true
    const el = ref.current

    if (cfg.kind === 'hpf-iframe') {
      // atOptions must be set inline immediately before invoke.js executes
      const optScript = document.createElement('script')
      optScript.type = 'text/javascript'
      optScript.text = [
        "atOptions = {",
        `  'key' : '${cfg.key}',`,
        "  'format' : 'iframe',",
        `  'height' : ${cfg.height},`,
        `  'width' : ${cfg.width},`,
        "  'params' : {}",
        "};",
      ].join('\n')
      el.appendChild(optScript)

      const invokeScript = document.createElement('script')
      invokeScript.type = 'text/javascript'
      invokeScript.src = cfg.src
      el.appendChild(invokeScript)
    }

    if (cfg.kind === 'adsterra-native') {
      const invokeScript = document.createElement('script')
      invokeScript.async = true
      invokeScript.setAttribute('data-cfasync', 'false')
      invokeScript.src = cfg.src
      el.appendChild(invokeScript)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (cfg.kind === 'hpf-iframe') {
    return (
      <div
        ref={ref}
        className={`ad-container ${className}`}
        style={{ width: cfg.width, height: cfg.height, overflow: 'hidden', flexShrink: 0 }}
      >
        <span className="ad-label">Advertisement</span>
      </div>
    )
  }

  // adsterra-native: the invoke.js fills the container div by its specific ID
  return (
    <div ref={ref} className={`ad-container ${className}`}>
      <span className="ad-label">Advertisement</span>
      <div id={cfg.containerId} />
    </div>
  )
}

// ─── GlobalAds ────────────────────────────────────────────────────────────────
// Mount once in layout.tsx. Loads the SocialBar (floating sticky bar) and
// arms the Popunder to fire on the first user click of each page session.
const SOCIAL_BAR_SRC =
  'https://pl29214640.profitablecpmratenetwork.com/93/9c/42/939c42665885fca4e84dc0c78b649c49.js'

export function GlobalAds() {
  useEffect(() => {
    if (!document.getElementById('adsterra-social-bar')) {
      const s = document.createElement('script')
      s.id = 'adsterra-social-bar'
      s.src = SOCIAL_BAR_SRC
      document.head.appendChild(s)
    }
  }, [])

  return null
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
// These keep the same API as the old AdUnit exports so all existing page
// imports continue to work without modification.

export function LeaderboardAd({ slot: _slot }: { slot: string }) {
  return (
    <div className="w-full flex justify-center py-2 bg-cream-2 border-b border-divider overflow-x-auto">
      <AdSlot slot="728x90" className="max-w-full" />
    </div>
  )
}

export function RectangleAd({ slot: _slot }: { slot: string }) {
  return <AdSlot slot="300x250" />
}

// InContentAd uses the 300x250 slot so multiple instances on one page are safe.
// Use <AdSlot slot="native-banner" /> directly where you want the native unit.
export function InContentAd({ slot: _slot }: { slot: string }) {
  return (
    <div className="my-6 flex justify-center">
      <AdSlot slot="300x250" />
    </div>
  )
}
