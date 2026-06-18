import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VolumeChart from '../components/VolumeChart'

const STATS = [
  { label: 'Disbursed (all time)', value: '$2,400,000', sub: '+$14k today', accent: 'text-purple-400' },
  { label: 'Payments (30d)',       value: '1,847',       sub: '99.3% success', accent: 'text-emerald-400' },
  { label: 'Active plugins',       value: '4',           sub: '2 pre-disburse', accent: 'text-blue-400' },
  { label: 'Avg latency',          value: '8.2s',        sub: 'Stellar confirm', accent: 'text-white' },
]

const RECENT = [
  { id: 'PAY-001', receiver: 'GABC...XYZ', amount: '$120.00', asset: 'USDC', status: 'Completed', time: '2 min ago', hook: 'kyc ✓ · sanctions ✓' },
  { id: 'PAY-002', receiver: 'GDEF...UVW', amount: '$85.50',  asset: 'USDC', status: 'Completed', time: '5 min ago', hook: 'kyc ✓ · sanctions ✓' },
  { id: 'PAY-003', receiver: 'GHIJ...RST', amount: '$200.00', asset: 'EURC', status: 'Pending',   time: '8 min ago', hook: 'kyc ✓ · sanctions ✓' },
  { id: 'PAY-004', receiver: 'GKLM...OPQ', amount: '$50.00',  asset: 'USDC', status: 'Completed', time: '12 min ago', hook: 'kyc ✓ · sanctions ✓' },
  { id: 'PAY-005', receiver: 'GNOP...MNO', amount: '$3,000',  asset: 'USDC', status: 'Failed',    time: '18 min ago', hook: 'kyc ✗' },
]

const STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50',
  Pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-800/50',
  Failed:    'bg-red-900/40 text-red-300 border-red-800/50',
}


export default function OverviewPage() {
  const [activePayments, setActivePayments] = useState(3)
  useEffect(() => {
    const t = setInterval(() => setActivePayments(n => Math.max(1, n + (Math.random() > 0.5 ? 1 : -1))), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Overview</h1>
          <p className="text-sm text-white/40">Disbursement analytics and live payment feed</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {activePayments} payments in flight
          </span>
          <Link to="/disburse"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/30">
            New disbursement
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className={`text-xl font-bold tabular-nums ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <VolumeChart />

      {/* Payment feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white/60">Recent payments</h2>
          <Link to="/payments" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/[0.06] bg-white/[0.02]">
                {['ID', 'Receiver', 'Amount', 'Hook checks', 'Status', 'Time'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map(r => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-purple-400 text-xs">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{r.receiver}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-400 text-xs tabular-nums">{r.amount} {r.asset}</td>
                  <td className="px-4 py-3 text-xs text-white/30 font-mono">{r.hook}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/20">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
