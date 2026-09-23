/**
 * Universal CSV Exporter for Enterprise Tables
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; header: string; format?: (val: any, row: T) => string }[]
) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.')
    return
  }

  const headerRow = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',')
  const dataRows = rows.map(row => {
    return columns.map(c => {
      let val: any = row[c.key as keyof T]
      if (c.format) {
        val = c.format(val, row)
      } else if (val === null || val === undefined) {
        val = ''
      } else if (typeof val === 'object') {
        val = JSON.stringify(val)
      }
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  })

  const csvContent = [headerRow, ...dataRows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
