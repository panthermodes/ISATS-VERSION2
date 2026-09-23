import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2, User, Layers, Cpu, CreditCard, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Sparkles, Check,
  Search, Plus, RefreshCw, Shield, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DeviceCatalogSelector } from '@/components/devices/DeviceCatalogSelector'
import { SelectedDevicesSummary } from '@/components/devices/SelectedDevicesSummary'
import { CustomDevicePayload } from '@/components/devices/CustomDeviceModal'

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [savingStep, setSavingStep] = useState(false)
  const [regRef, setRegRef] = useState<string>('')
  const [resumePrompt, setResumePrompt] = useState<string | null>(null)

  // Hardware Selections
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({
    LAPTOP: 25,
    DESKTOP: 40,
    ROUTER: 4,
    SWITCH_MANAGED: 12,
    POS_TERMINAL: 150,
    POS_RECEIPT_PRINTER: 150,
    CCTV_CAMERA: 64,
  })
  const [customDevices, setCustomDevices] = useState<CustomDevicePayload[]>([])
  const [catalogueData, setCatalogueData] = useState<any[]>([])

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Organization
    orgName: '',
    legalName: '',
    industry: 'Financial & IT Services',
    organizationType: 'PRIVATE_COMPANY',
    country: 'Tanzania',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    address: 'Bagamoyo Road, Victoria Plaza',
    email: '',
    phone: '',
    website: '',

    // Step 2: Administrator Account
    adminFullName: 'Shebby Panther',
    adminEmail: 'shebbyrasheed@gmail.com',
    adminPhone: '+255688961487',
    adminUsername: 'shebby',
    adminPassword: '',

    // Step 3: Structure & Scope
    employeeCount: '50',
    departmentsCount: '5',
    ictStaffCount: '3',
    locationsCount: '1',

    // Step 4: ICT Environment & Services
    services: {
      ticketing: true,
      assetManagement: true,
      preventiveMaintenance: true,
      inventoryTracking: true,
      slaManagement: true,
      qrTracking: true,
      auditLogs: true,
      emailNotifications: true,
    },

    // Step 6: Plan
    planName: 'Standard Enterprise SaaS',
    monthlyPrice: 100000,
    includedUsers: 250,

    // Step 7: Payment
    paymentProvider: 'MPESA',
    paymentPhone: '',
    accountNumber: '',
  })

  // Load device catalogue
  useEffect(() => {
    fetch('/api/device-catalogue/')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setCatalogueData(res.data)
        }
      })
      .catch(() => {})
  }, [])

  // Check draft in localStorage or query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlRef = params.get('ref')
    const savedRef = urlRef || localStorage.getItem('isats_registration_ref')

    if (savedRef) {
      setRegRef(savedRef)
      fetch(`/api/onboarding/resume/?ref=${savedRef}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data?.found) {
            const data = res.data.step_data || {}
            setResumePrompt(`Found saved registration draft (${savedRef}). Resuming your progress...`)

            if (data.step_1) {
              setFormData((prev) => ({
                ...prev,
                orgName: data.step_1.organization_name || prev.orgName,
                legalName: data.step_1.legal_name || prev.legalName,
                industry: data.step_1.industry || prev.industry,
                email: data.step_1.email || prev.email,
                phone: data.step_1.phone || prev.phone,
              }))
            }

            if (data.step_2) {
              setFormData((prev) => ({
                ...prev,
                adminFullName: data.step_2.admin_full_name || prev.adminFullName,
                adminEmail: data.step_2.admin_email || prev.adminEmail,
                adminUsername: data.step_2.admin_username || prev.adminUsername,
              }))
            }

            if (data.step_5?.devices) {
              setSelectedDevices(data.step_5.devices)
            }
            if (data.step_5?.custom_devices) {
              setCustomDevices(data.step_5.custom_devices)
            }

            if (res.data.current_step) {
              setStep(Math.min(9, Math.max(1, res.data.current_step)))
            }
          }
        })
        .catch(() => {})
    }
  }, [])

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateDeviceQuantity = (code: string, qty: number) => {
    setSelectedDevices((prev) => {
      const next = { ...prev }
      if (qty <= 0) {
        delete next[code]
      } else {
        next[code] = qty
      }
      return next
    })
  }

  const handleAddCustomDevice = (custom: CustomDevicePayload) => {
    setCustomDevices((prev) => [...prev, custom])
    if (custom.default_quantity && custom.default_quantity > 0) {
      updateDeviceQuantity(custom.name, custom.default_quantity)
    }
  }

  // Progressive DB persistence on EVERY step
  const saveCurrentStepToDB = async (stepNum: number) => {
    setSavingStep(true)
    let payload: any = {}

    if (stepNum === 1) {
      payload = {
        organization_name: formData.orgName,
        legal_name: formData.legalName,
        industry: formData.industry,
        organization_type: formData.organizationType,
        country: formData.country,
        region: formData.region,
        district: formData.district,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
      }
    } else if (stepNum === 2) {
      payload = {
        admin_full_name: formData.adminFullName,
        admin_email: formData.adminEmail,
        admin_phone: formData.adminPhone,
        admin_username: formData.adminUsername,
        admin_password: formData.adminPassword,
      }
    } else if (stepNum === 3) {
      payload = {
        employee_count: formData.employeeCount,
        departments_count: formData.departmentsCount,
        ict_staff_count: formData.ictStaffCount,
        locations_count: formData.locationsCount,
      }
    } else if (stepNum === 4) {
      payload = {
        services: formData.services,
      }
    } else if (stepNum === 5) {
      payload = {
        devices: selectedDevices,
        custom_devices: customDevices,
      }
    } else if (stepNum === 6) {
      payload = {
        plan_name: formData.planName,
        monthly_base_price: formData.monthlyPrice,
        included_users: formData.includedUsers,
      }
    } else if (stepNum === 7) {
      payload = {
        payment_provider: formData.paymentProvider,
        payment_phone: formData.paymentPhone,
        account_number: formData.accountNumber,
      }
    }

    try {
      const res = await fetch('/api/onboarding/step/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNum,
          registration_reference: regRef,
          payload,
        }),
      })
      const result = await res.json()
      if (result.success && result.data) {
        if (result.data.registration_reference) {
          setRegRef(result.data.registration_reference)
          localStorage.setItem('isats_registration_ref', result.data.registration_reference)
        }
      }
    } catch {
      // Local storage protects unsaved changes
    } finally {
      setSavingStep(false)
    }
  }

  const nextStep = async () => {
    await saveCurrentStepToDB(step)
    setStep((prev) => Math.min(prev + 1, 9))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinalize = async () => {
    setLoading(true)
    try {
      // Ensure step 5 devices and step 7 payments are saved
      await saveCurrentStepToDB(step)

      const res = await fetch('/api/onboarding/finalize/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_reference: regRef }),
      })
      const json = await res.json()
      if (json.success) {
        localStorage.removeItem('isats_registration_ref')
        setStep(9)
      } else {
        alert(json.error || 'Failed to complete registration')
      }
    } catch {
      alert('Error finalizing registration')
    } finally {
      setLoading(false)
    }
  }

  const stepsHeader = [
    { num: 1, label: 'Organization' },
    { num: 2, label: 'Administrator' },
    { num: 3, label: 'Structure' },
    { num: 4, label: 'ICT Env' },
    { num: 5, label: 'Devices' },
    { num: 6, label: 'Subscription' },
    { num: 7, label: 'Payment' },
    { num: 8, label: 'Review' },
    { num: 9, label: 'Complete' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">ISATS</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Enterprise Onboarding
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          {regRef && (
            <span className="text-slate-400 font-mono hidden md:inline">Draft: {regRef}</span>
          )}
          <Link to="/login" className="text-slate-400 hover:text-white">
            Already registered? <span className="text-blue-400 font-medium">Log In</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-start">
        {/* Resume Alert Banner */}
        {resumePrompt && (
          <div className="mb-6 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-300 flex items-center justify-between">
            <span>{resumePrompt}</span>
            <button
              onClick={() => setResumePrompt(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stepper Progress */}
        <div className="mb-8 hidden sm:flex items-center justify-between relative px-2">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 -z-0" />
          {stepsHeader.map((s) => (
            <div
              key={s.num}
              className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer ${
                step >= s.num ? 'text-blue-400 font-bold' : 'text-slate-500 font-medium'
              }`}
              onClick={() => s.num < step && setStep(s.num)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                  step === s.num
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30'
                    : step > s.num
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-[10px] whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
          {/* Step 1: Org Details */}
          {step === 1 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 1 — Organization Information</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Information is securely persisted to database draft as you progress.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Organization Name *"
                  placeholder="e.g. Apex Corporation Ltd"
                  value={formData.orgName}
                  onChange={(e) => updateField('orgName', e.target.value)}
                  required
                />
                <Input
                  label="Legal / Registered Name"
                  placeholder="Official entity name"
                  value={formData.legalName}
                  onChange={(e) => updateField('legalName', e.target.value)}
                />
                <Select
                  label="Organization Type"
                  value={formData.organizationType}
                  onChange={(e) => updateField('organizationType', e.target.value)}
                  options={[
                    { value: 'PRIVATE_COMPANY', label: 'Private Company' },
                    { value: 'GOVERNMENT', label: 'Government Agency' },
                    { value: 'NGO', label: 'NGO / Non-Profit' },
                    { value: 'UNIVERSITY', label: 'University / Education' },
                    { value: 'HOSPITAL', label: 'Hospital / Healthcare' },
                    { value: 'BANK', label: 'Bank / Financial Institution' },
                    { value: 'TECH', label: 'Technology Enterprise' },
                    { value: 'RETAIL', label: 'Retail & Commercial Chain' },
                  ]}
                />
                <Input
                  label="Industry"
                  placeholder="e.g. Financial Services"
                  value={formData.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                />
                <Input
                  label="Official Email *"
                  type="email"
                  placeholder="ict@company.co.tz"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
                <Input
                  label="Official Phone *"
                  placeholder="+255 700 000 000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                />
                <Input
                  label="Region / City"
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Administrator Account */}
          {step === 2 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 2 — Primary Administrator Credentials</h2>
                <p className="text-xs text-slate-400 mt-1">
                  This user will be provisioned as the tenant SuperAdmin / ICT Officer.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Administrator Full Name *"
                  placeholder="Shebby Panther"
                  value={formData.adminFullName}
                  onChange={(e) => updateField('adminFullName', e.target.value)}
                  required
                />
                <Input
                  label="Admin Email *"
                  type="email"
                  placeholder="shebbyrasheed@gmail.com"
                  value={formData.adminEmail}
                  onChange={(e) => updateField('adminEmail', e.target.value)}
                  required
                />
                <Input
                  label="Username *"
                  placeholder="e.g. apex_admin"
                  value={formData.adminUsername}
                  onChange={(e) => updateField('adminUsername', e.target.value)}
                  required
                />
                <Input
                  label="Initial Password *"
                  type="password"
                  placeholder="Strong password"
                  value={formData.adminPassword}
                  onChange={(e) => updateField('adminPassword', e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+255 754 112 233"
                  value={formData.adminPhone}
                  onChange={(e) => updateField('adminPhone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Structure & Scope */}
          {step === 3 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 3 — Organization Scope & Structure</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure employee scale and administrative operational units.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Total Estimated Employees"
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => updateField('employeeCount', e.target.value)}
                />
                <Input
                  label="Number of Departments"
                  type="number"
                  value={formData.departmentsCount}
                  onChange={(e) => updateField('departmentsCount', e.target.value)}
                />
                <Input
                  label="Dedicated ICT Staff Count"
                  type="number"
                  value={formData.ictStaffCount}
                  onChange={(e) => updateField('ictStaffCount', e.target.value)}
                />
                <Input
                  label="Branch / Facility Locations"
                  type="number"
                  value={formData.locationsCount}
                  onChange={(e) => updateField('locationsCount', e.target.value)}
                />
              </div>
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-300">
                💡 <strong>Entitlement Notice:</strong> The standard plan includes up to{' '}
                <strong>250 active employee users</strong> with unlimited ICT asset tracking and ticketing.
              </div>
            </div>
          )}

          {/* Step 4: ICT Environment & Services */}
          {step === 4 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 4 — Your ICT Environment & Services</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select the operational capabilities your organization needs to deploy.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'ticketing', label: 'ICT Incident & Request Ticketing', desc: 'SLA routing, technician queues, escalation policies' },
                  { key: 'assetManagement', label: 'Hardware Asset Tracking', desc: 'QR codes, barcode generation, check-in/out logs' },
                  { key: 'preventiveMaintenance', label: 'Maintenance & Health Monitoring', desc: 'Scheduled servicing, risk scores, maintenance profiles' },
                  { key: 'inventoryTracking', label: 'Consumables & Spare Parts', desc: 'Reorder levels and replenishment requisition' },
                  { key: 'slaManagement', label: 'SLA Breaches & Metrics', desc: 'Priority queues, automated alerts, compliance audits' },
                  { key: 'qrTracking', label: 'Field Mobile QR Scanning', desc: 'Camera scanning for rapid audit and physical verification' },
                  { key: 'auditLogs', label: 'Compliance Audit Logs', desc: 'Immutable security tracking of promotions and transfers' },
                  { key: 'emailNotifications', label: 'Real-time Notifications', desc: 'Instant status alerts to technicians and users' },
                ].map((s) => (
                  <label
                    key={s.key}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean((formData.services as any)[s.key])}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          services: { ...prev.services, [s.key]: e.target.checked },
                        }))
                      }
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">{s.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Complete ICT Device Catalog */}
          {step === 5 && (
            <div className="space-y-4">
              <DeviceCatalogSelector
                selectedDevices={selectedDevices}
                onUpdateQuantity={updateDeviceQuantity}
                onAddCustomDevice={handleAddCustomDevice}
                customDevicesList={customDevices}
              />
            </div>
          )}

          {/* Step 6: Subscription Plan */}
          {step === 6 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 6 — Subscription Tier</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Transparent commercial pricing with all features enabled.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-600/50 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold uppercase">
                      Recommended
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">Standard Enterprise SaaS</h3>
                    <p className="text-xs text-slate-400">Complete suite with full ICT device catalog and QR workflows.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-blue-400">TZS 100,000</span>
                    <span className="text-xs text-slate-400 block">/ month</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">✓ Up to 250 included active users</div>
                  <div className="flex items-center gap-2">✓ Unlimited ICT asset cataloging</div>
                  <div className="flex items-center gap-2">✓ High-res QR & Barcode generation</div>
                  <div className="flex items-center gap-2">✓ Automated device reconciliation</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Payment */}
          {step === 7 && (
            <div className="space-y-4 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 7 — Billing & Payment Method</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select payment provider to activate your organization workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'MPESA', label: 'Vodacom M-Pesa' },
                  { id: 'TIGO_PESA', label: 'Tigo Pesa (Mixx)' },
                  { id: 'AIRTEL_MONEY', label: 'Airtel Money' },
                  { id: 'BANK_TRANSFER', label: 'Bank Wire / CRDB' },
                  { id: 'CARD', label: 'Visa / Mastercard' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField('paymentProvider', p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.paymentProvider === p.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-2 text-blue-400" />
                    <div className="text-xs font-bold text-white">{p.label}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Billing Phone / Account *"
                  placeholder="+255 754 000 111"
                  value={formData.paymentPhone}
                  onChange={(e) => updateField('paymentPhone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 8: Comprehensive Review */}
          {step === 8 && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Step 8 — Review & Confirmation</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Confirm your organizational profile and declared hardware before provisioning.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase">Organization</h4>
                  <div className="text-xs text-slate-300">
                    <div><strong>Name:</strong> {formData.orgName || 'N/A'}</div>
                    <div><strong>Type:</strong> {formData.organizationType}</div>
                    <div><strong>Email:</strong> {formData.email || 'N/A'}</div>
                    <div><strong>Location:</strong> {formData.region}, {formData.country}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase">Administrator</h4>
                  <div className="text-xs text-slate-300">
                    <div><strong>Admin:</strong> {formData.adminFullName || formData.adminUsername}</div>
                    <div><strong>Email:</strong> {formData.adminEmail || formData.email}</div>
                    <div><strong>Role:</strong> SuperAdmin / ICT Officer</div>
                  </div>
                </div>
              </div>

              {/* Declared ICT Environment Breakdown */}
              <SelectedDevicesSummary
                selectedMap={selectedDevices}
                catalogue={catalogueData}
                customDevices={customDevices}
                onEdit={() => setStep(5)}
              />
            </div>
          )}

          {/* Step 9: Complete */}
          {step === 9 && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Organization Successfully Activated!</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your enterprise tenant, ICT device catalog, and administrative credentials have been fully provisioned.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization:</span>
                  <span className="font-bold text-white">{formData.orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Username:</span>
                  <span className="font-mono text-blue-400 font-bold">{formData.adminUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Declared Hardware:</span>
                  <span className="font-bold text-emerald-400">
                    {Object.values(selectedDevices).reduce((a, b) => a + b, 0)} units declared
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <Button
                  variant="primary"
                  onClick={() => navigate('/dashboard')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Organization Dashboard
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/assets/create')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Register First Asset & Generate QR
                </Button>
              </div>
            </div>
          )}

          {/* Footer Controls (Steps 1 - 8) */}
          {step < 9 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {savingStep && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving draft...
                  </span>
                )}

                {step === 8 ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={loading}
                    onClick={handleFinalize}
                    leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  >
                    {loading ? 'Provisioning Workspace...' : 'Complete Registration'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Save & Continue
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} ISATS Enterprise Onboarding</span>
            <span className="text-slate-400 font-medium">Developed and Maintained by PantherMode</span>
          </div>
        </div>
      </div>
    </div>
  )
}
