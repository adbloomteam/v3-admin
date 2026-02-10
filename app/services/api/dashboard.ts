import type { DashboardStats } from '~/types'

export function useDashboardService() {
  const { apiFetch } = useApi()

  async function getStats(): Promise<DashboardStats> {
    return apiFetch<DashboardStats>('/dashboard/stats')
  }

  return { getStats }
}
