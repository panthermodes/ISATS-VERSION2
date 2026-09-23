import React from 'react'
import { Search, X, Filter } from 'lucide-react'

interface CategoryTab {
  id?: number | string
  slug: string
  name: string
  count?: number
}

interface DeviceSearchProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  categories: CategoryTab[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
  totalSelected: number
  showSelectedOnly: boolean
  onToggleSelectedOnly: (show: boolean) => void
}

export function DeviceSearch({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  totalSelected,
  showSelectedOnly,
  onToggleSelectedOnly,
}: DeviceSearchProps) {
  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hardware (e.g., Laptop, POS, Router, CCTV, Server, Printer)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Only Filter Toggle */}
        <button
          type="button"
          onClick={() => onToggleSelectedOnly(!showSelectedOnly)}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            showSelectedOnly
              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-[#101D2E] border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Selected</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              showSelectedOnly ? 'bg-white text-blue-700' : 'bg-slate-100 dark:bg-[#0B1728] text-blue-600 dark:text-blue-400'
            }`}
          >
            {totalSelected}
          </span>
        </button>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              : 'bg-white dark:bg-[#101D2E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E293B]'
          }`}
        >
          All Categories
        </button>

        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onCategoryChange(c.slug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === c.slug
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'bg-white dark:bg-[#101D2E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E293B]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}
