// Safe date formatting that works with SSR
export function formatDate(timestamp: number | bigint): string {
  try {
    const date = new Date(Number(timestamp) * 1000)
    // Use ISO string for consistent server/client rendering
    return date.toISOString().split('T')[0]
  } catch {
    return 'Invalid date'
  }
}

export function formatDateTime(timestamp: number | bigint): string {
  try {
    const date = new Date(Number(timestamp) * 1000)
    // Use ISO string and format it consistently
    const dateStr = date.toISOString()
    return `${dateStr.split('T')[0]} ${dateStr.split('T')[1].split('.')[0]}`
  } catch {
    return 'Invalid date'
  }
}