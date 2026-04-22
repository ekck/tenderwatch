'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LabelList,
  AreaChart, Area, LineChart, Line, Legend,
} from 'recharts'
import type { CountyAnalytics } from '@/lib/api'
import { formatKES } from '@/lib/api'

const F = { forest: '#1a4731', forest2: '#2d7a56', gold: '#c9a84c', gold2: '#e8c96a' }
const PALETTE = [F.forest, F.gold, F.forest2, '#7a5a10', '#4a7a60', '#b8943c', '#1f5a3d', '#c9953c']
const STATUS_COLOR: Record<string, string> = { active: '#1a6b3a', complete: '#5a5a50', cancelled: '#8b2020' }

const fmtAxis = (v: number) => {
  if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v/1e6).toFixed(0)}M`
  if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`
  return String(v)
}

const fmtMonth = (m: string) => {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' })
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#ddd8ce] rounded-xl p-3 shadow-lg text-xs max-w-[220px]">
      <p className="text-[#1a1a18] font-bold mb-1.5 pb-1.5 border-b border-[#ddd8ce]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex justify-between gap-3 mt-1">
          <span style={{ color: p.stroke || p.fill || p.color }} className="font-medium">{p.name}</span>
          <span className="font-mono font-bold text-[#1a1a18]">
            {typeof p.value === 'number' && p.value > 100000 ? formatKES(p.value) : (p.value?.toLocaleString() ?? '—')}
          </span>
        </p>
      ))}
    </div>
  )
}

const Empty = () => (
  <div className="h-48 flex flex-col items-center justify-center text-[#7a7a70] gap-2">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
    <span className="text-sm">No data available for this county yet</span>
  </div>
)

const Card = ({ title, sub, children, span2 = false }: { title: string; sub: string; children: React.ReactNode; span2?: boolean }) => (
  <div className={`bg-white border border-[#ddd8ce] rounded-xl shadow-sm p-5 ${span2 ? 'lg:col-span-2' : ''}`}>
    <h3 className="font-serif font-bold text-lg text-[#1a4731] mb-0.5">{title}</h3>
    <p className="text-[#7a7a70] text-xs mb-4">{sub}</p>
    {children}
  </div>
)

export default function CountyCharts({ data }: { data: CountyAnalytics }) {
  const { by_category, by_method, by_status, by_month, value_ranges } = data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* 1 — Monthly trend (full width) */}
      <Card title="Tender Volume Over Time" sub="Number of tenders published per month — last 18 months" span2>
        {by_month.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={by_month} margin={{ left: 0, right: 10 }}>
              <defs>
                <linearGradient id="countyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={F.forest} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={F.forest} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="month" tickFormatter={fmtMonth}
                tick={{ fill:'#4a4a44', fontSize:10, fontWeight:500 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="count" name="Tenders" stroke={F.forest} strokeWidth={2.5}
                fill="url(#countyGrad)" dot={{ r:3, fill:F.forest, strokeWidth:0 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 2 — Monthly value trend (full width) */}
      <Card title="Contract Value Trend (KES)" sub="Total estimated value of tenders published each month" span2>
        {by_month.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={by_month} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="month" tickFormatter={fmtMonth}
                tick={{ fill:'#4a4a44', fontSize:10, fontWeight:500 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={fmtAxis} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="total_value" name="Value (KES)" stroke={F.gold}
                strokeWidth={2.5} dot={{ r:3, fill:F.gold, strokeWidth:0 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 3 — Category bar */}
      <Card title="Tenders by Category" sub="Breakdown of tender types in this county">
        {by_category.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={by_category} margin={{ left: -5 }}>
              <XAxis dataKey="category" tick={{ fill:'#4a4a44', fontSize:11, fontWeight:500 }}
                tickFormatter={(v: string) => v ? v.charAt(0).toUpperCase() + v.slice(1) : v}
                tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(26,71,49,0.06)' }} />
              <Bar dataKey="count" name="Tenders" fill={F.forest} radius={[4,4,0,0]} maxBarSize={48}>
                <LabelList dataKey="count" position="top" style={{ fill:'#2e2e2a', fontSize:11, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 4 — Category value */}
      <Card title="Contract Value by Category (KES)" sub="Total estimated value grouped by category">
        {by_category.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={Math.max(120, by_category.length * 60)}>
            <BarChart data={by_category} layout="vertical" margin={{ left: 10, right: 80 }}>
              <XAxis type="number" tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={fmtAxis} />
              <YAxis type="category" dataKey="category" tick={{ fill:'#2e2e2a', fontSize:12, fontWeight:600 }}
                tickLine={false} axisLine={false} width={75} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(201,168,76,0.08)' }} />
              <Bar dataKey="total_value" name="Value (KES)" fill={F.gold} radius={[0,4,4,0]} maxBarSize={40}>
                <LabelList dataKey="total_value" position="right" formatter={(v:number) => formatKES(v)}
                  style={{ fill:'#2e2e2a', fontSize:11, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 5 — Procurement methods pie */}
      <Card title="Procurement Methods" sub="Open vs direct vs restricted tendering in this county">
        {by_method.length === 0 ? <Empty /> : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={by_method} dataKey="count" nameKey="method"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={35} paddingAngle={3}>
                  {by_method.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
              {by_method.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="text-xs text-ink-2 capitalize font-medium">{m.method}</span>
                  <span className="text-xs font-mono font-bold text-forest">{m.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* 6 — Status breakdown pie */}
      <Card title="Tender Status Breakdown" sub="Current status distribution of all county tenders">
        {by_status.length === 0 ? <Empty /> : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={by_status} dataKey="count" nameKey="status"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={35} paddingAngle={3}>
                  {by_status.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLOR[s.status?.toLowerCase()] ?? PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
              {by_status.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full"
                    style={{ background: STATUS_COLOR[s.status?.toLowerCase()] ?? PALETTE[i % PALETTE.length] }} />
                  <span className="text-xs text-ink-2 capitalize font-medium">{s.status}</span>
                  <span className="text-xs font-mono font-bold text-forest">{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* 7 — Value size distribution (full width) */}
      <Card title="Tender Size Distribution" sub="How many tenders fall in each contract value band" span2>
        {value_ranges.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={value_ranges} margin={{ left: -5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
              <XAxis dataKey="band" tick={{ fill:'#4a4a44', fontSize:10, fontWeight:500 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(26,71,49,0.06)' }} />
              <Bar dataKey="count" name="Tenders" radius={[4,4,0,0]} maxBarSize={48}>
                {value_ranges.map((_, i) => (
                  <Cell key={i} fill={`hsl(${150 - i * 12}, 50%, ${38 + i * 4}%)`} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fill:'#2e2e2a', fontSize:11, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  )
}
