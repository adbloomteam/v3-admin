import { useQuery } from '@tanstack/vue-query'

export function useDashboardQuery() {
  const { getStats } = useDashboardService()

  return useQuery({
    queryKey: ['dashboard'] as const,
    queryFn: () => getStats(),
  })
}
