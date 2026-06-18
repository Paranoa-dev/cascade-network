/**
 * VolumeChart — Recharts area chart showing monthly disbursement volume,
 * successful transactions, and pending batches for the Overview dashboard.
 */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface VolumeDataPoint {
  month: string
  volume: number        // total disbursed (USD)
  successful: number    // successful transactions
  pending: number       // pending transactions
}

const DEFAULT_DATA: VolumeDataPoint[] = [
  { month: 'Jan', volume: 142000, successful: 210, pending: 12 },
  { month: 'Feb', volume: 198000, successful: 287, pending: 8  },
  { month: 'Mar', volume: 175000, successful: 254, pending: 19 },
  { month: 'Apr', volume: 231000, successful: 341, pending: 6  },
  { month: 'May', volume: 289000, successful: 412, pending: 23 },
  { month: 'Jun', volume: 314000, successful: 467, pending: 14 },
]

interface Props {
  data?: VolumeDataPoint[]
}

const TOOLTIP_STYLE = {
  backgroundColor: '#0f0a1e',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#fff',
  fontSize: 12,
}

export default function VolumeChart({ data = DEFAULT_DATA }: Props) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/70">Monthly disbursement volume</p>
        <span className="text-xs text-emerald-400 font-mono">↑ +23% vs prior period</span>
      </div>

      {/* Volume area chart */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Volume']}
          />
          <Area type="monotone" dataKey="volume" stroke="#a855f7" strokeWidth={2} fill="url(#gradVolume)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Successful vs pending chart */}
      <div className="pt-2 border-t border-white/[0.05]">
        <p className="text-xs text-white/40 mb-3">Transactions — successful vs pending</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
            <Area type="monotone" dataKey="successful" name="Successful" stroke="#34d399" strokeWidth={2} fill="url(#gradSuccess)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="pending"    name="Pending"    stroke="#fbbf24" strokeWidth={2} fill="url(#gradPending)"    dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
