import { useQuery } from '@tanstack/vue-query'
import type { ListTransactionsParams } from '~/types'

export function useTransactionsQuery(params: Ref<ListTransactionsParams> | ListTransactionsParams = {}) {
  const { listTransactions } = useTransactionService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['transactions', resolvedParams] as const,
    queryFn: () => listTransactions(toValue(resolvedParams)),
  })
}
