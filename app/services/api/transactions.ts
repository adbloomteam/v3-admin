import type { PaginatedResponse, Transaction, ListTransactionsParams } from '~/types'

export function useTransactionService() {
  const { apiFetch } = useApi()

  async function listTransactions(params: ListTransactionsParams = {}): Promise<PaginatedResponse<Transaction>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.search) query.set('search', params.search)
    if (params.type) query.set('type', params.type)
    if (params.userId) query.set('userId', params.userId)
    const qs = query.toString()
    return apiFetch<PaginatedResponse<Transaction>>(`/transactions${qs ? `?${qs}` : ''}`)
  }

  return { listTransactions }
}
