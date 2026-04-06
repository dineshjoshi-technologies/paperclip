'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Save, Plus, Trash2, Edit, Globe, DollarSign, Flag } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  isPopular: boolean
}

interface PlatformSettings {
  siteName: string
  siteUrl: string
  supportEmail: string
  defaultDomain: string
  maintenanceMode: boolean
  registrationEnabled: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'DJ Technologies',
    siteUrl: 'https://djtech.app',
    supportEmail: 'support@djtech.app',
    defaultDomain: 'djtech.app',
    maintenanceMode: false,
    registrationEnabled: true,
  })

  const [tiers, setTiers] = useState<PricingTier[]>([
    { id: '1', name: 'Free', price: 0, billingCycle: 'monthly', features: ['1 Website', 'Basic Templates', 'Community Support'], isPopular: false },
    { id: '2', name: 'Starter', price: 19, billingCycle: 'monthly', features: ['5 Websites', 'All Templates', 'Email Support', 'Custom Domain'], isPopular: false },
    { id: '3', name: 'Pro', price: 49, billingCycle: 'monthly', features: ['Unlimited Websites', 'Premium Templates', 'Priority Support', 'Custom Domain', 'Analytics', 'Team Members'], isPopular: true },
    { id: '4', name: 'Enterprise', price: 199, billingCycle: 'monthly', features: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support', 'SLA', 'Custom Integrations'], isPopular: false },
  ])

  const [editingTier, setEditingTier] = useState<string | null>(null)
  const [showAddTier, setShowAddTier] = useState(false)
  const [newTier, setNewTier] = useState<Omit<PricingTier, 'id'>>({
    name: '',
    price: 0,
    billingCycle: 'monthly',
    features: [''],
    isPopular: false,
  })

  const handleSaveSettings = () => {
    // Save settings
  }

  const handleAddTier = () => {
    if (!newTier.name.trim()) return
    const tier: PricingTier = {
      ...newTier,
      id: String(tiers.length + 1),
    }
    setTiers((prev) => [...prev, tier])
    setNewTier({ name: '', price: 0, billingCycle: 'monthly', features: [''], isPopular: false })
    setShowAddTier(false)
  }

  const handleDeleteTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Platform Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure platform-wide settings and pricing tiers
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General Settings
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Site URL</label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, siteUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Default Domain</label>
              <Input
                value={settings.defaultDomain}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultDomain: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <label htmlFor="maintenance" className="text-sm text-zinc-700 dark:text-zinc-300">Maintenance Mode</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registration"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, registrationEnabled: e.target.checked }))}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <label htmlFor="registration" className="text-sm text-zinc-700 dark:text-zinc-300">Allow Registration</label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-1" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Tiers
              </CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowAddTier(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tier.isPopular
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}>
                    <span className="text-white font-bold text-sm">{tier.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{tier.name}</p>
                      {tier.isPopular && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      ${tier.price}/{tier.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingTier(tier.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTier(tier.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Feature Flags
          </CardTitle>
          <CardDescription>Toggle platform features on or off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'AI Content Generation', description: 'Enable AI-powered content suggestions', enabled: true },
              { name: 'Custom Domains', description: 'Allow users to connect custom domains', enabled: true },
              { name: 'Team Collaboration', description: 'Multi-user website editing', enabled: false },
              { name: 'Analytics Dashboard', description: 'Website traffic and performance analytics', enabled: true },
              { name: 'Export to HTML', description: 'Allow users to export their websites', enabled: false },
            ].map((flag) => (
              <div key={flag.name} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{flag.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{flag.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={flag.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Tier Modal */}
      <Modal open={showAddTier} onClose={() => setShowAddTier(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Add Pricing Tier
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tier Name</label>
            <Input
              value={newTier.name}
              onChange={(e) => setNewTier((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Business"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price ($)</label>
              <Input
                type="number"
                value={newTier.price}
                onChange={(e) => setNewTier((prev) => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Billing Cycle</label>
              <Select
                value={newTier.billingCycle}
                onChange={(e) => setNewTier((prev) => ({ ...prev, billingCycle: e.target.value as 'monthly' | 'yearly' }))}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddTier(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTier} disabled={!newTier.name.trim()}>Add Tier</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
