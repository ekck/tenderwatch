'use client'
import { useEffect, useRef } from 'react'

// ─── Slot registry ────────────────────────────────────────────────────────────
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
export function AdSlot({ slot, className = '' }: { slot: AdSlotId; className?: string }) {
  const scriptRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)
  const cfg = SLOTS[slot]

  useEffect(() => {
    if (!scriptRef.current || loaded.current) return
    loaded.current = true
    const el = scriptRef.current

    if (cfg.kind === 'hpf-iframe') {
      // Set atOptions synchronously before invoke.js loads so it can read them.
      // Both scripts are siblings inside a plain block div — no flex interference.
      const optScript = document.createElement('script')
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
      // Outer wrapper: just positions the label. No flex on the script container.
      <div className={`relative ${className}`} style={{ width: cfg.width, height: cfg.height }}>
        <span className="ad-label">Advertisement</span>
        {/* scriptRef div is a plain block — invoke.js inserts its iframe here */}
        <div ref={scriptRef} style={{ width: cfg.width, height: cfg.height, lineHeight: 0 }} />
      </div>
    )
  }

  // adsterra-native
  return (
    <div className={`relative ${className}`}>
      <span className="ad-label">Advertisement</span>
      <div ref={scriptRef}>
        <div id={cfg.containerId} />
      </div>
    </div>
  )
}

// ─── GlobalAds ────────────────────────────────────────────────────────────────
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

    const reposition = (el: HTMLElement) => {
      if (el.style.position === 'fixed' && (el.style.top === '0px' || el.style.top === '0')) {
        el.style.top = 'auto'
        el.style.bottom = '0'
      }
    }

    Array.from(document.body.children).forEach(el => reposition(el as HTMLElement))

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) reposition(node)
        })
      }
    })
    observer.observe(document.body, { childList: true })

    return () => observer.disconnect()
  }, [])

  return null
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
export function LeaderboardAd({ slot: _slot }: { slot: string }) {
  return (
    <div className="w-full flex justify-center py-3 bg-cream-2 border-b border-divider">
      <AdSlot slot="300x250" />
    </div>
  )
}

export function RectangleAd({ slot: _slot }: { slot: string }) {
  return <AdSlot slot="300x250" />
}

export function InContentAd({ slot: _slot }: { slot: string }) {
  return (
    <div className="my-6 flex justify-center">
      <AdSlot slot="300x250" />
    </div>
  )
}
