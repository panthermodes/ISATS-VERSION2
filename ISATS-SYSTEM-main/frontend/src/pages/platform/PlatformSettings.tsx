import { useState } from 'react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Shield, Key, Bell, Server, Check } from 'lucide-react'

export default function PlatformSettings() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'ISATS Multi-Tenant Cloud',
    ownerEntity: 'PantherMode Technologies Ltd',
    supportEmail: 'support@isats.co.tz',
    defaultCurrency: 'TZS',
    defaultIncludedUsers: 250,
    basePlanPrice: 100000,
    mpesaShortcode: 'VOD-TZ-889100',
    tigoPesaBiller: 'TIGO-MIXX-9901',
    crdbAccount: '0150992388100',
    gracePeriodDays: 7,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PlatformAdminLayout pageTitle="Global Platform Configuration">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">PantherMode Master Controls</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system-wide parameters, payment gateway identifiers, and grace periods.
          </p>
        </div>

        {/* Global Commercial Settings */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Defaults</h3>
              <p className="text-[11px] text-slate-400">Standard defaults applied to newly provisioned tenants.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Base Subscription (TZS / mo)"
              type="number"
              value={settings.basePlanPrice}
              onChange={(e) => setSettings({ ...settings, basePlanPrice: Number(e.target.value) })}
            />
            <Input
              label="Included Users Cap"
              type="number"
              value={settings.defaultIncludedUsers}
              onChange={(e) => setSettings({ ...settings, defaultIncludedUsers: Number(e.target.value) })}
            />
            <Input
              label="Billing Grace Period (Days)"
              type="number"
              value={settings.gracePeriodDays}
              onChange={(e) => setSettings({ ...settings, gracePeriodDays: Number(e.target.value) })}
            />
            <Input
              label="Default Operating Currency"
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
            />
          </div>
        </Card>

        {/* Payment Gateways */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Gateway Parameters</h3>
              <p className="text-[11px] text-slate-400">Mobile money shortcodes and bank settlement account routing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vodacom M-Pesa Till / Shortcode"
              value={settings.mpesaShortcode}
              onChange={(e) => setSettings({ ...settings, mpesaShortcode: e.target.value })}
            />
            <Input
              label="Tigo Pesa Biller Code"
              value={settings.tigoPesaBiller}
              onChange={(e) => setSettings({ ...settings, tigoPesaBiller: e.target.value })}
            />
            <div className="md:col-span-2">
              <Input
                label="CRDB Bank Settlement Account"
                value={settings.crdbAccount}
                onChange={(e) => setSettings({ ...settings, crdbAccount: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs gap-2">
            {saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Settings Saved' : 'Save Platform Settings'}
          </Button>
        </div>
      </div>
    </PlatformAdminLayout>
  )
}
