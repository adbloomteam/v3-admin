import { useQuery } from '@tanstack/vue-query'
import type { ListPayoutsParams } from '~/types'

export function usePayoutsQuery(params: Ref<ListPayoutsParams> | ListPayoutsParams = {}) {
  const { listPayouts } = usePayoutService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['payouts', resolvedParams] as const,
    queryFn: () => listPayouts(toValue(resolvedParams)),
  })
}
