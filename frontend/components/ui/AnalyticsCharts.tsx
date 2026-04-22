'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList, LineChart, Line, CartesianGrid, Area, AreaChart,
} from 'recharts'
import { formatKES } from '@/lib/api'

const F = { forest: '#1a4731', forest2: '#2d7a56', gold: '#c9a84c', gold2: '#e8c96a' }
const PALETTE = [F.forest, F.gold, F.forest2, '#7a5a10', '#4a7a60', '#b8943c', '#1f5a3d', '#c9953c']
const STATUS_COLOR: Record<string, string> = {
  active: '#1a6b3a', complete: '#5a5a50', cancelled: '#8b2020', planning: '#7a5a10',
}

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
    <div className="bg-white border border-[#ddd8ce] rounded-xl p-3 shadow-lg text-xs max-w-[200px]">
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

const Empty = ({ msg = 'No data yet — run a sync to populate' }) => (
  <div className="h-52 flex flex-col items-center justify-center text-[#7a7a70] gap-2">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
    <span className="text-sm">{msg}</span>
  </div>
)

const Card = ({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) => (
  <div className="bg-white border border-[#ddd8ce] rounded-xl shadow-sm p-5">
    <h3 className="font-serif font-bold text-lg text-[#1a4731] mb-0.5">{title}</h3>
    <p className="text-[#7a7a70] text-xs mb-4">{sub}</p>
    {children}
  </div>
)

interface Props {
  counties:   { county: string; tender_count: number; total_value: number }[]
  categories: { category: string; count: number; total_value: number }[]
  methods:    { method: string; count: number; total_value: number }[]
  statuses:   { status: string; count: number; total_value: number }[]
  monthly:    { month: string; count: number; total_value: number }[]
  ranges:     { band: string; count: number }[]
}

export default function AnalyticsCharts({ counties, categories, methods, statuses, monthly, ranges }: Props) {
  const top10 = counties.slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* 1 — Monthly trend (full width) */}
      <Card title="Tender Volume Trend" sub="Number of tenders published per month — last 12 months" >
        {monthly.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ left: -5, right: 10 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={F.forest} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={F.forest} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
              <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="count" name="Tenders" stroke={F.forest} strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r:3, fill:F.forest }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 2 — Status breakdown */}
      <Card title="Tender Status Breakdown" sub="Current status of all tenders in the database">
        {statuses.length === 0 ? <Empty /> : (
          <>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={statuses} dataKey="count" nameKey="status" cx="50%" cy="50%"
                  outerRadius={75} innerRadius={30} paddingAngle={3}>
                  {statuses.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLOR[s.status?.toLowerCase()] ?? PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
              {statuses.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[s.status?.toLowerCase()] ?? PALETTE[i % PALETTE.length] }} />
                  <span className="text-xs text-[#2e2e2a] capitalize font-medium">{s.status}</span>
                  <span className="text-xs font-mono font-bold text-[#1a4731]">{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* 3 — Tenders by county */}
      <Card title="Tenders by County" sub="Top 10 counties by number of published tenders">
        {top10.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10} margin={{ left: -5, bottom: 22 }}>
              <XAxis dataKey="county" tick={{ fill:'#4a4a44', fontSize:10, fontWeight:500 }} tickLine={false} axisLine={false}
                angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={fmtAxis} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(26,71,49,0.06)' }} />
              <Bar dataKey="tender_count" name="Tenders" fill={F.forest} radius={[4,4,0,0]} maxBarSize={30}>
                <LabelList dataKey="tender_count" position="top" style={{ fill:'#2e2e2a', fontSize:9, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 4 — Procurement methods */}
      <Card title="Procurement Methods" sub="Distribution of open, direct, and restricted tendering">
        {methods.length === 0 ? <Empty /> : (
          <>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={methods} dataKey="count" nameKey="method" cx="50%" cy="50%"
                  outerRadius={75} innerRadius={30} paddingAngle={3}>
                  {methods.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
              {methods.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="text-xs text-[#2e2e2a] capitalize font-medium">{m.method}</span>
                  <span className="text-xs font-mono font-bold text-[#1a4731]">{m.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* 5 — Contract value by category (full width) */}
      <Card title="Contract Value by Category" sub="Total KES value of awarded contracts — works, goods, services">
        {categories.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={Math.max(140, categories.length * 60)}>
            <BarChart data={categories} layout="vertical" margin={{ left: 10, right: 90 }}>
              <XAxis type="number" tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={fmtAxis} />
              <YAxis type="category" dataKey="category" tick={{ fill:'#2e2e2a', fontSize:12, fontWeight:600 }}
                tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(201,168,76,0.08)' }} />
              <Bar dataKey="total_value" name="Contract Value" fill={F.gold} radius={[0,4,4,0]} maxBarSize={40}>
                <LabelList dataKey="total_value" position="right"
                  formatter={(v: number) => formatKES(v)}
                  style={{ fill:'#2e2e2a', fontSize:11, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 6 — Contract value ranges */}
      <Card title="Tender Size Distribution" sub="How many tenders fall into each contract value band">
        {ranges.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ranges} margin={{ left: -5, bottom: 10 }}>
              <XAxis dataKey="band" tick={{ fill:'#4a4a44', fontSize:9, fontWeight:500 }} tickLine={false} axisLine={false}
                interval={0} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(26,71,49,0.06)' }} />
              <Bar dataKey="count" name="Tenders" radius={[4,4,0,0]} maxBarSize={36}>
                {ranges.map((_, i) => (
                  <Cell key={i} fill={`hsl(${150 - i * 12}, 50%, ${38 + i * 4}%)`} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fill:'#2e2e2a', fontSize:10, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 7 — County spend (full width) */}
      <Card title="Procurement Spend by County (KES)" sub="Total estimated value of all tenders — top 10 counties">
        {top10.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top10} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
              <XAxis dataKey="county" tick={{ fill:'#4a4a44', fontSize:10, fontWeight:500 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:'#7a7a70', fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={fmtAxis} />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(201,168,76,0.08)' }} />
              <Bar dataKey="total_value" name="Spend (KES)" fill={F.gold} radius={[4,4,0,0]} maxBarSize={40}>
                <LabelList dataKey="total_value" position="top" formatter={fmtAxis}
                  style={{ fill:'#2e2e2a', fontSize:9, fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  )
}
