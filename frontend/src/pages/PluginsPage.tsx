import { useState } from 'react'

interface Plugin {
  name: string
  event: string
  enabled: boolean
  description: string
}

const DEFAULT_PLUGINS: Plugin[] = [
  { name: 'kyc-check', event: 'pre-disbursement', enabled: true, description: 'Verifies receiver KYC status before payment' },
  { name: 'sanctions-screen', event: 'pre-disbursement', enabled: true, description: 'Screens receiver against OFAC sanctions list' },
  { name: 'slack-notify', event: 'post-disbursement', enabled: false, description: 'Posts payment confirmation to Slack channel' },
  { name: 'analytics-log', event: 'post-disbursement', enabled: true, description: 'Logs payment to analytics pipeline' },
  { name: 'failure-alert', event: 'on-failure', enabled: true, description: 'Sends alert email on payment failure' },
]

const EVENT_COLORS: Record<string, string> = {
  'pre-disbursement':  'bg-blue-900/40 text-blue-300',
  'post-disbursement': 'bg-green-900/40 text-green-300',
  'on-failure':        'bg-red-900/40 text-red-300',
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState(DEFAULT_PLUGINS)

  const toggle = (name: string) =>
    setPlugins(ps => ps.map(p => p.name === name ? { ...p, enabled: !p.enabled } : p))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-1">Compliance Plugins</h1>
          <p className="text-gray-400">Manage hook plugins that run at each stage of the disbursement lifecycle.</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all">
          + Add Plugin
        </button>
      </div>

      <div className="grid gap-3">
        {plugins.map(p => (
          <div key={p.name} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-base font-semibold text-white">{p.name}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${EVENT_COLORS[p.event]}`}>{p.event}</span>
              </div>
              <p className="text-sm text-gray-400">{p.description}</p>
            </div>
            <button
              onClick={() => toggle(p.name)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                p.enabled ? 'bg-amber-500' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                p.enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-xl p-6 text-center">
        <div className="text-gray-400 mb-2">Custom Plugin Integration</div>
        <code className="font-mono text-sm text-amber-400 bg-black/30 px-3 py-1 rounded">
          sdk.hooks.register()
        </code>
        <p className="text-xs text-gray-500 mt-2">Install custom plugins via SDK</p>
      </div>
    </div>
  )
}
