import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, QrCode, Barcode } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { createAsset } from '@/services/assets'
import { getCategories } from '@/services/categories'
import { getDepartments } from '@/services/departments'
import { AssetDeviceTypeSelect, OrgDeviceTypeOption } from '@/components/devices/AssetDeviceTypeSelect'
import type { Category, Department } from '@/types'

const schema = z.object({
  asset_tag:        z.string().min(1, 'Asset tag is required'),
  serial_number:    z.string().min(1, 'Serial number is required'),
  asset_name:       z.string().min(1, 'Asset name is required'),
  asset_type:       z.string().min(1, 'Please select a device type'),
  manufacturer:     z.string().min(1, 'Manufacturer is required'),
  model:            z.string().min(1, 'Model is required'),
  status:           z.string().default('Active'),
  priority_level:   z.string().default('Low'),
  condition_status: z.string().default('Good'),
  location:         z.string().optional(),
  vendor_name:      z.string().optional(),
  purchase_date:    z.string().optional(),
  warranty_expiry:  z.string().optional(),
  category:         z.string().optional(),
  department:       z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateAsset() {
  const navigate = useNavigate()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeviceType, setSelectedDeviceType] = useState<OrgDeviceTypeOption | null>(null)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getDepartments().then(setDepartments).catch(() => {})
  }, [])

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active', priority_level: 'Low', condition_status: 'Good' },
  })

  const handleDeviceTypeSelected = (device: OrgDeviceTypeOption | null) => {
    setSelectedDeviceType(device)
    if (device) {
      setValue('asset_type', device.name, { shouldValidate: true })
    } else {
      setValue('asset_type', '', { shouldValidate: true })
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const asset = await createAsset({
        ...data,
        status: data.status as any,
        priority_level: data.priority_level as any,
        condition_status: data.condition_status as any,
        category: data.category ? { id: Number(data.category) } as any : null,
        department: data.department ? { id: Number(data.department) } as any : null,
        device_type_id: selectedDeviceType ? selectedDeviceType.id : undefined,
      } as any)

      toast.success('Asset created successfully with QR code and Barcode!')
      navigate(`/assets/${asset.asset_id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.asset_tag?.[0] || err?.response?.data?.detail || 'Failed to create asset'
      toast.error(msg)
    }
  }

  return (
    <OrganizationLayout pageTitle="Add Asset">
      <PageHeader
        title="Add New Asset"
        subtitle="Register an individual hardware asset from your organization's device catalog"
        breadcrumbs={[{ label: 'Assets', href: '/assets' }, { label: 'Add Asset' }]}
        actions={<Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
        {/* Device Catalog Classification */}
        <Card title="Device Catalog & Hardware Type">
          <div className="space-y-3 mt-2">
            <AssetDeviceTypeSelect
              value={selectedDeviceType ? selectedDeviceType.id : ''}
              onChange={(e) => {}}
              onSelectDevice={handleDeviceTypeSelected}
              error={errors.asset_type?.message}
              required
            />
            {selectedDeviceType && (
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-blue-300 flex items-center justify-between">
                <span>Selected Type: <strong>{selectedDeviceType.name}</strong> ({selectedDeviceType.category_name})</span>
                {selectedDeviceType.is_custom && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    Organization Custom
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Basic Info */}
        <Card title="Asset Identification">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Input label="Asset Tag *" placeholder="e.g. ISATS-ORG01-LAP-0001" required error={errors.asset_tag?.message} {...register('asset_tag')} />
            <Input label="Serial Number *" placeholder="Manufacturer serial number" required error={errors.serial_number?.message} {...register('serial_number')} />
            <Input label="Asset Display Name *" placeholder="e.g. Dell Latitude 5530 - Finance" required error={errors.asset_name?.message} {...register('asset_name')} />
            <Input label="Manufacturer *" placeholder="e.g. Dell / Cisco / HP" required error={errors.manufacturer?.message} {...register('manufacturer')} />
            <Input label="Model *" placeholder="e.g. Latitude 5530" required error={errors.model?.message} {...register('model')} />
            <Input label="Physical Location" placeholder="e.g. HQ 4th Floor Server Room" error={errors.location?.message} {...register('location')} />
          </div>
        </Card>

        {/* Assignment & Organizational Unit */}
        <Card title="Classification & Department">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Select
              label="Status"
              options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Disposed', label: 'Disposed' }]}
              {...register('status')}
            />
            <Select
              label="Priority Level"
              options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]}
              {...register('priority_level')}
            />
            <Select
              label="Condition"
              options={[{ value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Poor', label: 'Poor' }]}
              {...register('condition_status')}
            />
            <Select
              label="Department"
              options={[{ value: '', label: 'Select Department' }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))]}
              {...register('department')}
            />
          </div>
        </Card>

        {/* Procurement & Warranty */}
        <Card title="Procurement & Warranty">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <Input label="Purchase Date" type="date" {...register('purchase_date')} />
            <Input label="Warranty Expiry" type="date" {...register('warranty_expiry')} />
            <Input label="Vendor / Supplier" placeholder="Supplier company" {...register('vendor_name')} />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <QrCode className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>
              Unique <strong>Asset ID</strong>, high-resolution <strong>QR Code</strong>, and <strong>Code128 Barcode</strong> will be automatically generated upon creation.
            </span>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>Register Asset</Button>
        </div>
      </form>
    </OrganizationLayout>
  )
}
