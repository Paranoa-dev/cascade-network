import { useState } from 'react'

interface PaymentRow {
  id: string
  receiver: string
  amount: string
  memo: string
  valid: boolean | null
}

export default function DisbursePage() {
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: '1', receiver: '', amount: '', memo: '', valid: null }
  ])
  const [asset, setAsset] = useState('USDC')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const addRow = () => setRows(r => [...r, { id: Date.now().toString(), receiver: '', amount: '', memo: '', valid: null }])
  const removeRow = (id: string) => setRows(r => r.filter(row => row.id !== id))
  
  const updateRow = (id: string, field: keyof PaymentRow, value: any) => {
    setRows(r => r.map(row => {
      if (row.id === id) {
        const nextRow = { ...row, [field]: value }
        if (field === 'receiver') {
          // Simple validation rule: Stellar public key starts with G, length 56
          nextRow.valid = value.startsWith('G') && value.length === 56
        }
        return nextRow
      }
      return row
    }))
  }

  const total = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    // Simulate parsing CSV files
    setRows([
      { id: '101', receiver: 'GABCXDFG18291048BCFDE918274A7B2983CDEF1827FA8BCDE8291A2B', amount: '120.00', memo: 'Consulting', valid: true },
      { id: '102', receiver: 'GDEF291847192837BCFDE2918471A7B2983CDEF1827FA8BCDE8291A3B', amount: '240.50', memo: 'Marketing', valid: true },
      { id: '103', receiver: 'GHIJ102948192837BCFDE918274A7B2983CDEF1827FA8BCDE8291A4B', amount: '80.00', memo: 'Admin support', valid: true }
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1800))
    setSubmitting(false)
    setResult(`Successfully dispatched batch of ${rows.length} payouts to Stellar Core. Total committed: $${total.toLocaleString()} ${asset}.`)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-slate-400 bg-clip-text text-transparent">
            New Bulk Disbursement
          </h1>
          <p className="text-slate-400 text-sm mt-1">Send secure mass payroll and supplier payouts in a single atomic batch</p>
        </div>
      </div>

      {/* CSV Drag & Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-white/10 bg-slate-950/20 hover:border-white/20'
        }`}
      >
        <span className="text-2xl block mb-2">📥</span>
        <p className="text-xs text-slate-300 font-semibold">Drag and drop your payout CSV / JSON sheet here</p>
        <p className="text-[10px] text-slate-500 mt-1">Supports receiver address, amount, and optional memo columns</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/30 backdrop-blur-md p-6 shadow-xl ring-1 ring-white/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-semibold uppercase">Payout Asset</label>
            <select 
              value={asset} 
              onChange={e => setAsset(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all font-semibold"
            >
              {['USDC', 'EURC', 'XLM'].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">ESTIMATED TOTAL</span>
            <p className="text-lg font-bold text-purple-400 mt-0.5">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {asset}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_130px_1fr_40px] gap-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider px-1">
            <span>Receiver Wallet ID (G...)</span>
            <span>Amount</span>
            <span>Memo</span>
            <span />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {rows.map(row => (
              <div key={row.id} className="grid grid-cols-[1fr_130px_1fr_40px] gap-3 items-center">
                <div className="relative">
                  <input 
                    value={row.receiver} 
                    onChange={e => updateRow(row.id, 'receiver', e.target.value)}
                    placeholder="G..." 
                    required
                    className={`w-full bg-slate-900/60 border rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none transition-all ${
                      row.valid === true ? 'border-emerald-500/40 focus:border-emerald-500' :
                      row.valid === false ? 'border-red-500/40 focus:border-red-500' :
                      'border-white/10 focus:border-purple-500'
                    }`} 
                  />
                  {row.valid === true && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold">✓</span>
                  )}
                </div>
                <input 
                  value={row.amount} 
                  onChange={e => updateRow(row.id, 'amount', e.target.value)}
                  placeholder="0.00" 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  required
                  className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all font-mono" 
                />
                <input 
                  value={row.memo} 
                  onChange={e => updateRow(row.id, 'memo', e.target.value)}
                  placeholder="Optional memo"
                  className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all" 
                />
                <button 
                  type="button" 
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button 
              type="button" 
              onClick={addRow}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              + Add Payout Recipient
            </button>
            <div className="flex gap-2">
              <span className="text-[10px] text-slate-500 font-mono">Gas: ~0.015 XLM</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-950/20 cursor-pointer"
            >
              {submitting ? 'Submitting Batch Payout...' : `Confirm & Send ${rows.length} Payout${rows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-4 text-emerald-400 text-sm font-medium animate-fadeIn">
          {result}
        </div>
      )}
    </div>
  )
}
