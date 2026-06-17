import { useState } from 'react'

const ALL_PAYMENTS = [
  { id: 'PAY-001', receiver: 'GABC...XYZ', amount: '$120.00', asset: 'USDC', status: 'Completed', memo: 'Aid batch #12', time: '2026-05-10 12:01' },
  { id: 'PAY-002', receiver: 'GDEF...UVW', amount: '$85.50',  asset: 'USDC', status: 'Completed', memo: 'Payroll Q2',    time: '2026-05-10 12:00' },
  { id: 'PAY-003', receiver: 'GHIJ...RST', amount: '$200.00', asset: 'EURC', status: 'Pending',   memo: 'Invoice #4421',time: '2026-05-10 11:58' },
  { id: 'PAY-004', receiver: 'GKLM...OPQ', amount: '$50.00',  asset: 'USDC', status: 'Completed', memo: '',            time: '2026-05-10 11:55' },
  { id: 'PAY-005', receiver: 'GNOP...MNO', amount: '$3,000',  asset: 'USDC', status: 'Failed',    memo: 'KYC rejected', time: '2026-05-10 11:50' },
]

const STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-green-900/50 text-green-300',
  Pending:   'bg-yellow-900/50 text-yellow-300',
  Failed:    'bg-red-900/50 text-red-300',
}

type FilterStatus = 'All' | 'Completed' | 'Pending' | 'Failed'

export default function PaymentsPage() {
  const [filter, setFilter] = useState<FilterStatus>('All')

  const visible = filter === 'All' ? ALL_PAYMENTS : ALL_PAYMENTS.filter(p => p.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Payments</h1>
        <p className="text-gray-400 text-sm">All disbursement payments and their current status</p>
      </div>

      <div className="flex gap-2">
        {(['All', 'Completed', 'Pending', 'Failed'] as FilterStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              filter === f ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-500 self-center">{visible.length} records</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              {['ID', 'Receiver', 'Amount', 'Asset', 'Memo', 'Status', 'Time'].map(h => (
                <th key={h} className="pb-2 pr-4 font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} className="border-b border-gray-800/40 hover:bg-gray-800/20">
                <td className="py-3 pr-4 font-mono text-purple-400 text-xs">{p.id}</td>
                <td className="py-3 pr-4 font-mono text-xs">{p.receiver}</td>
                <td className="py-3 pr-4 text-green-400">{p.amount}</td>
                <td className="py-3 pr-4 text-gray-300">{p.asset}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">{p.memo || '—'}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="py-3 text-xs text-gray-500">{p.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
