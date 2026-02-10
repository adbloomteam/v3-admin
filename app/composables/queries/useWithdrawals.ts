import { useQuery } from '@tanstack/vue-query'
import type { ListWithdrawalsParams } from '~/types'

export function useWithdrawalsQuery(params: Ref<ListWithdrawalsParams> | ListWithdrawalsParams = {}) {
  const { listWithdrawals } = useWithdrawalService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['withdrawals', resolvedParams] as const,
    queryFn: () => listWithdrawals(toValue(resolvedParams)),
  })
}
