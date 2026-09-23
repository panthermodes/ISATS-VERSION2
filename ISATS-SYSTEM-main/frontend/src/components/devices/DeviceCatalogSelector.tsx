import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'
import { DeviceSearch } from './DeviceSearch'
import { DeviceCategorySection } from './DeviceCategorySection'
import { CustomDeviceModal, CustomDevicePayload } from './CustomDeviceModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export interface CategoryData {
  id?: number | string
  name: string
  slug: string
  icon?: string
  description?: string
  types: Array<{
    id?: number | string
    code: string
    name: string
    description?: string
    is_custom?: boolean
    is_enabled?: boolean
    icon?: string
  }>
}

interface DeviceCatalogSelectorProps {
  selectedDevices: Record<string, number>
  onUpdateQuantity: (code: string, qty: number) => void
  onAddCustomDevice?: (custom: CustomDevicePayload) => Promise<void> | void
  customDevicesList?: CustomDevicePayload[]
  className?: string
}

export function DeviceCatalogSelector({
  selectedDevices,
  onUpdateQuantity,
  onAddCustomDevice,
  customDevicesList = [],
  className = '',
}: DeviceCatalogSelectorProps) {
  const [catalogue, setCatalogue] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  const fetchCatalogue = () => {
    setLoading(true)
    setError(null)
    fetch('/api/device-catalogue/')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCatalogue(res.data)
        } else {
          throw new Error(res.error || 'Failed to parse hardware catalogue')
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to ICT device catalog service.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCatalogue()
  }, [])

  // Calculate total selected count
  const totalSelected = Object.values(selectedDevices).filter((qty) => qty > 0).length

  // Filter categories and types based on search, activeCategory, and showSelectedOnly
  const filteredCategories = catalogue
    .filter((cat) => activeCategory === 'all' || cat.slug === activeCategory)
    .map((cat) => {
      const q = searchQuery.toLowerCase().trim()
      let types = cat.types

      if (q) {
        types = types.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        )
      }

      if (showSelectedOnly) {
        types = types.filter((t) => (selectedDevices[t.code] || 0) > 0)
      }

      return {
        ...cat,
        types,
      }
    })
    .filter((cat) => cat.types.length > 0)

  // Append custom devices if any exist
  const customTypes = customDevicesList.map((cd) => ({
    code: cd.name,
    name: cd.name,
    description: cd.description || 'Organization custom device type',
    is_custom: true,
    is_enabled: true,
    icon: 'cpu',
  }))

  const finalCategories = [...filteredCategories]
  if (customTypes.length > 0 && (activeCategory === 'all' || activeCategory === 'custom')) {
    finalCategories.push({
      id: 'custom_org_category',
      name: 'Custom Organization Hardware',
      slug: 'custom',
      icon: 'cpu',
      description: 'Proprietary hardware types defined specifically for your organization.',
      types: customTypes,
    })
  }

  const handleToggleDevice = (code: string, selected: boolean) => {
    if (!selected) {
      onUpdateQuantity(code, 0)
    } else {
      onUpdateQuantity(code, selectedDevices[code] || 1)
    }
  }

  const handleSaveCustom = async (data: CustomDevicePayload) => {
    if (onAddCustomDevice) {
      await onAddCustomDevice(data)
    }
    if (data.default_quantity && data.default_quantity > 0) {
      onUpdateQuantity(data.name, data.default_quantity)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header bar: Title + Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Hardware Taxonomy & Ownership</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Level 2 Catalog
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the ICT device types your organization operates and enter approximate quantities.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsCustomModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4 text-blue-400" />}
          className="whitespace-nowrap"
        >
          Can't find device? Add Custom
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <DeviceSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={catalogue.map((c) => ({ slug: c.slug, name: c.name }))}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        totalSelected={totalSelected}
        showSelectedOnly={showSelectedOnly}
        onToggleSelectedOnly={setShowSelectedOnly}
      />

      {/* Loading State: Skeleton Cards */}
      {loading && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Skeleton variant="rect" height="20px" className="w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <Skeleton variant="rect" height="32px" className="w-8 rounded-lg" />
                  <Skeleton variant="rect" height="14px" className="w-3/4" />
                  <Skeleton variant="rect" height="10px" className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-800/40 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Unable to load ICT device catalog</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchCatalogue}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty Search State */}
      {!loading && !error && finalCategories.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No matching device types found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for another keyword or add a custom ICT device type for your organization.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCustomModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add "{searchQuery || 'Custom Device'}" as Custom Type
          </Button>
        </div>
      )}

      {/* Category Sections */}
      {!loading && !error && finalCategories.length > 0 && (
        <div className="space-y-4">
          {finalCategories.map((category) => (
            <DeviceCategorySection
              key={category.slug || category.id}
              category={category as any}
              selectedDevices={selectedDevices}
              onToggleDevice={handleToggleDevice}
              onQuantityChange={onUpdateQuantity}
            />
          ))}
        </div>
      )}

      {/* Custom Device Creation Modal */}
      <CustomDeviceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustom}
        categories={catalogue.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
      />
    </div>
  )
}
