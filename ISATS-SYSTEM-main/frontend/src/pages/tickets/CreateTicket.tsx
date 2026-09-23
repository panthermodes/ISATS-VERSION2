import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { createTicket } from '@/services/tickets'
import { getCategories } from '@/services/categories'
import { getAssets } from '@/services/assets'
import type { Category, Asset } from '@/types'

const schema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide more detail'),
  priority:    z.string().min(1, 'Select a priority'),
  category:    z.string().optional(),
  asset:       z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateTicket() {
  const navigate = useNavigate()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [assets, setAssets] = useState<Asset[]>([])

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getAssets({ page: 1 }).then((r) => setAssets(r.results)).catch(() => {})
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Medium' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const ticket = await createTicket({
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        category: data.category ? { id: Number(data.category) } as any : null,
        asset: data.asset ? { asset_id: data.asset } as any : null,
      })
      toast.success('Ticket submitted successfully!')
      navigate(`/tickets/${ticket.id}`)
    } catch { toast.error('Failed to submit ticket. Please try again.') }
  }

  return (
    <OrganizationLayout pageTitle="Create Ticket">
      <PageHeader
        title="Submit a Ticket"
        subtitle="Describe your issue and we'll assign it to the right team"
        breadcrumbs={[{ label: 'Tickets', href: '/tickets' }, { label: 'New Ticket' }]}
        actions={<Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Title" placeholder="Brief summary of the issue" required error={errors.title?.message} {...register('title')} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary-900 dark:text-slate-200">Description <span className="text-danger">*</span></label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="Provide as much detail as possible…"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                required
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Critical', label: 'Critical' },
                ]}
                error={errors.priority?.message}
                {...register('priority')}
              />
              {categories.length > 0 && (
                <Select
                  label="Category"
                  placeholder="Select category"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  {...register('category')}
                />
              )}
            </div>

            {assets.length > 0 && (
              <Select
                label="Related Asset (optional)"
                placeholder="Select an asset if relevant"
                options={assets.map((a) => ({ value: a.asset_id, label: `${a.asset_tag} — ${a.asset_name}` }))}
                {...register('asset')}
              />
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={isSubmitting}>Submit Ticket</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
