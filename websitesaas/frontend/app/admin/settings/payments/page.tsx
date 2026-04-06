'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { CreditCard, Eye, EyeOff, Save, Check } from 'lucide-react'

interface GatewayConfig {
  name: string
  enabled: boolean
  publicKey: string
  secretKey: string
  webhookSecret: string
  mode: 'test' | 'live'
}

export default function AdminPaymentsPage() {
  const [stripe, setStripe] = useState<GatewayConfig>({
    name: 'Stripe',
    enabled: true,
    publicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxx',
    secretKey: 'sk_test_xxxxxxxxxxxxxxxxxxxx',
    webhookSecret: 'whsec_xxxxxxxxxxxxxxxxxxxx',
    mode: 'test',
  })

  const [razorpay, setRazorpay] = useState<GatewayConfig>({
    name: 'Razorpay',
    enabled: false,
    publicKey: 'rzp_test_xxxxxxxxxxxx',
    secretKey: 'xxxxxxxxxxxxxxxxxxxx',
    webhookSecret: '',
    mode: 'test',
  })

  const [editingStripe, setEditingStripe] = useState(false)
  const [editingRazorpay, setEditingRazorpay] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const toggleGateway = (gateway: 'stripe' | 'razorpay') => {
    if (gateway === 'stripe') {
      setStripe((prev) => ({ ...prev, enabled: !prev.enabled }))
    } else {
      setRazorpay((prev) => ({ ...prev, enabled: !prev.enabled }))
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const maskSecret = (value: string) => {
    if (!value) return ''
    return value.slice(0, 8) + '•'.repeat(Math.max(0, value.length - 8))
  }

  const GatewayCard = ({
    gateway,
    state,
    setState,
    editing,
    setEditing,
  }: {
    gateway: GatewayConfig
    state: GatewayConfig
    setState: (s: GatewayConfig) => void
    editing: boolean
    setEditing: (e: boolean) => void
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${gateway.enabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
              <CreditCard className={`h-5 w-5 ${gateway.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'}`} />
            </div>
            <div>
              <CardTitle className="text-base">{gateway.name}</CardTitle>
              <CardDescription>
                <span className={`inline-flex items-center gap-1 ${
                  gateway.enabled ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {gateway.enabled ? <Check className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {gateway.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </CardDescription>
            </div>
          </div>
          <Button
            variant={gateway.enabled ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => toggleGateway(gateway.name.toLowerCase() as 'stripe' | 'razorpay')}
          >
            {gateway.enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mode</label>
            <div className="flex gap-2">
              {(['test', 'live'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => editing && setState({ ...state, mode })}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    state.mode === mode
                      ? mode === 'live'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                  disabled={!editing}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Public Key</label>
            <Input
              value={state.publicKey}
              onChange={(e) => editing && setState({ ...state, publicKey: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Secret Key</label>
            <div className="relative">
              <Input
                type={showSecrets[`${gateway.name}-secret`] ? 'text' : 'password'}
                value={editing ? state.secretKey : maskSecret(state.secretKey)}
                onChange={(e) => editing && setState({ ...state, secretKey: e.target.value })}
                disabled={!editing}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility(`${gateway.name}-secret`)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showSecrets[`${gateway.name}-secret`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Webhook Secret</label>
            <Input
              value={state.webhookSecret}
              onChange={(e) => editing && setState({ ...state, webhookSecret: e.target.value })}
              disabled={!editing}
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setEditing(false)}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Edit Configuration
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payment Gateway Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure and manage payment gateway integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GatewayCard
          gateway={stripe}
          state={stripe}
          setState={setStripe}
          editing={editingStripe}
          setEditing={setEditingStripe}
        />
        <GatewayCard
          gateway={razorpay}
          state={razorpay}
          setState={setRazorpay}
          editing={editingRazorpay}
          setEditing={setEditingRazorpay}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
          <CardDescription>Overview of payment processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Gateways', value: [stripe, razorpay].filter((g) => g.enabled).length.toString() },
              { label: 'Total Processed', value: '$142,847' },
              { label: 'Successful Rate', value: '98.7%' },
              { label: 'Failed Transactions', value: '23' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
