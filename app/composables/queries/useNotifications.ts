import { useQuery } from '@tanstack/vue-query'

export function useNotificationsQuery(params: Ref<{ page?: number; perPage?: number }> | { page?: number; perPage?: number } = {}) {
  const { listNotifications } = useNotificationService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['notifications', resolvedParams] as const,
    queryFn: () => listNotifications(toValue(resolvedParams)),
  })
}
