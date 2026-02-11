/** Convert cents to formatted dollar string */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/** Format integer points, e.g. 1500 → "1,500 pts" */
export function formatPoints(points: number | null | undefined): string {
  if (points === null || points === undefined) return '0 pts'
  return `${points.toLocaleString()} pts`
}

/** Format points as USD, e.g. 1500 → "$15.00" */
export function formatPointsAsUSD(points: number | null | undefined): string {
  if (points === null || points === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(points / 100)
}

/** Format ISO date to readable string */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Format ISO date to readable date + time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Mission type emoji map */
export const missionTypeEmoji: Record<string, string> = {
  affiliate: '🔗',
  survey: '📋',
  cpg: '📦',
  digital_review: '⭐',
  ugc: '🎬',
  focus_group: '🎯',
}

/** Category emoji map */
export const categoryEmoji: Record<string, string> = {
  beauty: '💄',
  food: '🍔',
  health: '💪',
  tech: '📱',
  home: '🏠',
  fashion: '👗',
  entertainment: '🎬',
  finance: '💰',
}

/** Status badge color map (Nuxt UI color names) */
export const statusColor: Record<string, string> = {
  draft: 'neutral',
  active: 'success',
  paused: 'warning',
  completed: 'info',
  archived: 'neutral',
}
