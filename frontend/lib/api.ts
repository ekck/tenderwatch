// Server-side (SSR): use internal Docker service name directly
// Client-side (browser): use empty string → nginx proxies /api/* to backend
const isServer = typeof window === 'undefined'
const API_URL = isServer
  ? (process.env.INTERNAL_API_URL || 'http://backend:5000')
  : (process.env.NEXT_PUBLIC_API_URL || '')

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    next: { revalidate: 300 }, // 5-minute cache
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface Tender {
  id: number
  ocid: string
  title: string
  status: 'active' | 'complete' | 'cancelled'
  procurement_method: string
  category: string
  value_amount: number | null
  value_currency: string
  tender_period_start: string | null
  tender_period_end: string | null
  date_published: string | null
  county: string | null
  entity: Entity | null
  description?: string
  award?: Award | null
}

export interface Entity {
  id: number
  ocid: string
  name: string
  entity_type: string
  county: string | null
  tender_count: number
  total_contract_value?: number
  recent_tenders?: Tender[]
}

export interface Award {
  id: number
  award_id: string
  status: string
  value_amount: number | null
  value_currency: string
  date_awarded: string | null
  supplier: Supplier | null
}

export interface Supplier {
  id: number
  name: string
  identifier: string | null
  contract_count: number
  total_value: number
}

export interface Pagination {
  page: number
  per_page: number
  total: number
  pages: number
  has_next: boolean
  has_prev: boolean
}

export interface TendersResponse {
  tenders: Tender[]
  pagination: Pagination
}

export interface AnalyticsSummary {
  total_tenders: number
  total_awards: number
  total_entities: number
  total_suppliers: number
  total_contract_value_kes: number
  direct_procurement_count: number
  direct_procurement_pct: number
}

// Tenders
export const getTenders = (params?: Record<string, string | number>) => {
  const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
  return apiFetch<TendersResponse>(`/api/tenders/${query}`)
}

export const getTender = (id: number) =>
  apiFetch<Tender>(`/api/tenders/${id}`)

// Entities
export const getEntities = (params?: Record<string, string | number>) => {
  const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
  return apiFetch<{ entities: Entity[]; pagination: Pagination }>(`/api/entities/${query}`)
}

export const getEntity = (id: number) =>
  apiFetch<Entity>(`/api/entities/${id}`)

// Analytics
export const getAnalyticsSummary = () =>
  apiFetch<AnalyticsSummary>('/api/analytics/summary')

export const getByCounty = () =>
  apiFetch<{ county: string; tender_count: number; total_value: number }[]>('/api/analytics/by-county')

export const getByCategory = () =>
  apiFetch<{ category: string; count: number; total_value: number }[]>('/api/analytics/by-category')

export const getByMethod = () =>
  apiFetch<{ method: string; count: number; total_value: number }[]>('/api/analytics/by-method')

export const getTopSuppliers = (limit = 10) =>
  apiFetch<{ supplier: string; contract_count: number; total_value: number }[]>(
    `/api/analytics/top-suppliers?limit=${limit}`
  )

export const getTopEntities = (limit = 10) =>
  apiFetch<{ entity: string; county: string; tender_count: number; total_value: number }[]>(
    `/api/analytics/top-entities?limit=${limit}`
  )

// Alerts
export const subscribe = (data: {
  email: string
  keywords?: string[]
  categories?: string[]
  counties?: string[]
}) => apiFetch('/api/alerts/subscribe', { method: 'POST', body: JSON.stringify(data) })

// Formatting helpers
export function formatKES(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return 'N/A'
  if (amount >= 1_000_000_000) return `KES ${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`
  return `KES ${amount.toLocaleString()}`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Returns the display status, overriding 'active' to 'closed' when the
// tender period has already ended — the DB value is never auto-updated.
export function resolveStatus(status: string, periodEnd: string | null): string {
  if (status?.toLowerCase() === 'active' && periodEnd && new Date(periodEnd) < new Date()) {
    return 'closed'
  }
  return status?.toLowerCase() ?? 'complete'
}

export function statusClass(status: string): string {
  return {
    active: 'badge-active',
    complete: 'badge-complete',
    cancelled: 'badge-cancelled',
    closed: 'badge-closed',
  }[status?.toLowerCase()] || 'badge-complete'
}

export function methodClass(method: string): string {
  if (!method) return ''
  const m = method.toLowerCase()
  if (m.includes('open')) return 'badge-open'
  if (m.includes('direct')) return 'badge-direct'
  if (m.includes('restricted')) return 'badge-restricted'
  return 'badge-open'
}

export const getByStatus = () =>
  apiFetch<{ status: string; count: number; total_value: number }[]>('/api/analytics/by-status')

export const getByMonth = () =>
  apiFetch<{ month: string; count: number; total_value: number }[]>('/api/analytics/by-month')

export const getValueRanges = () =>
  apiFetch<{ band: string; count: number }[]>('/api/analytics/value-ranges')

export interface CountyAnalytics {
  county: string
  summary: {
    total_tenders: number
    active_tenders: number
    total_value: number
    direct_procurement_pct: number
    direct_count: number
  }
  by_category:  { category: string; count: number; total_value: number }[]
  by_method:    { method: string; count: number; total_value: number }[]
  by_status:    { status: string; count: number }[]
  by_month:     { month: string; count: number; total_value: number }[]
  top_entities: { entity: string; tender_count: number; total_value: number }[]
  top_suppliers:{ supplier: string; contract_count: number; total_value: number }[]
  value_ranges: { band: string; count: number }[]
}

export const getCountyAnalytics = (county: string) =>
  apiFetch<CountyAnalytics>(`/api/analytics/county/${encodeURIComponent(county)}`)
