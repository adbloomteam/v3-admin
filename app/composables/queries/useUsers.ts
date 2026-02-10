import { useQuery } from '@tanstack/vue-query'
import type { ListUsersParams } from '~/types'

export function useUsersQuery(params: Ref<ListUsersParams> | ListUsersParams = {}) {
  const { listUsers } = useUserService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['users', resolvedParams] as const,
    queryFn: () => listUsers(toValue(resolvedParams)),
  })
}

export function useUserQuery(id: Ref<string> | string) {
  const { getUser } = useUserService()
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery({
    queryKey: ['user', resolvedId] as const,
    queryFn: () => getUser(toValue(resolvedId)),
    enabled: () => !!toValue(resolvedId),
  })
}
