import React from 'react'
import clsx from 'clsx'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  width?: string
  className?: string
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (row: T) => void
  keyField?: keyof T
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  emptyIcon,
  onRowClick,
  keyField = 'id' as keyof T,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border dark:border-primary-700">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-primary-900/50 border-b border-border dark:border-primary-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx('table-header font-heading', col.className)}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-primary-800">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-16 text-center text-muted"
              >
                <div className="flex flex-col items-center gap-3">
                  {emptyIcon && <div className="text-slate-300 dark:text-slate-600">{emptyIcon}</div>}
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={String(row[keyField] ?? idx)}
                className={clsx(
                  'table-row',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('table-cell font-primary', col.className)}>
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
