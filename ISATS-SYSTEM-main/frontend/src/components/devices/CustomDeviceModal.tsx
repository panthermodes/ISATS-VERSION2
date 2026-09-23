import React, { useState } from 'react'
import { Plus, Cpu, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export interface CustomDevicePayload {
  name: string
  category: string
  description?: string
  manufacturer?: string
  model_family?: string
  notes?: string
  default_quantity?: number
}

interface CustomDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomDevicePayload) => Promise<void> | void
  categories: Array<{ id?: number | string; name: string; slug: string }>
}

export function CustomDeviceModal({ isOpen, onClose, onSave, categories }: CustomDeviceModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0]?.slug || 'other')
  const [description, setDescription] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [modelFamily, setModelFamily] = useState('')
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter a device name.')
      return
    }

    try {
      setLoading(true)
      await onSave({
        name: name.trim(),
        category,
        description: description.trim(),
        manufacturer: manufacturer.trim(),
        model_family: modelFamily.trim(),
        notes: notes.trim(),
        default_quantity: Math.max(0, quantity || 0),
      })
      // Reset form
      setName('')
      setDescription('')
      setManufacturer('')
      setModelFamily('')
      setNotes('')
      setQuantity(0)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save custom device type.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom ICT Device Type"
      subtitle="Define specialized organizational hardware not listed in standard catalog."
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Device Type Name *"
                placeholder="e.g. Specialized Banking Terminal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <Select
              label="Hardware Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions.length ? categoryOptions : [{ value: 'other', label: 'Other ICT Equipment' }]}
            />

            <Input
              label="Estimated / Declared Qty"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
            />

            <Input
              label="Manufacturer (Optional)"
              placeholder="e.g. Wincor Nixdorf / NCR"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />

            <Input
              label="Model Family (Optional)"
              placeholder="e.g. ProCash 8000"
              value={modelFamily}
              onChange={(e) => setModelFamily(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Device Description
            </label>
            <textarea
              rows={2}
              placeholder="Detailed description of the hardware function and placement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#07111F] border border-slate-300 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">🔒 Tenant Privacy:</span>
            <span>
              This custom device type is securely isolated and will <strong>only</strong> be visible to your organization.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !name.trim()}
              leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            >
              {loading ? 'Saving...' : 'Add Device Type'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
