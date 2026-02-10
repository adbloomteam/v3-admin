import { useQuery } from '@tanstack/vue-query'
import type { ListMissionsParams } from '~/types'

export function useMissionsQuery(params: Ref<ListMissionsParams> | ListMissionsParams = {}) {
  const { listMissions } = useMissionService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['missions', resolvedParams] as const,
    queryFn: () => listMissions(toValue(resolvedParams)),
  })
}

export function useMissionQuery(id: Ref<string> | string) {
  const { getMission } = useMissionService()
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery({
    queryKey: ['mission', resolvedId] as const,
    queryFn: () => getMission(toValue(resolvedId)),
    enabled: () => !!toValue(resolvedId),
  })
}
