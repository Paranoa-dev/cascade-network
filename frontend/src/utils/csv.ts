/**
 * CSV export utility for disbursement history.
 * Converts an array of objects to a CSV string and triggers a browser download.
 */

/** Escape a cell value: wrap in quotes if it contains commas, quotes, or newlines. */
function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/** Serialize an array of records to a RFC-4180 CSV string. */
export function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escapeCell(row[h])).join(',')),
  ]
  return lines.join('\r\n')
}

/** Trigger a browser download of the given CSV content. */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
