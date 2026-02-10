import type { PaginatedResponse, WithdrawalListItem, ListWithdrawalsParams, UpdateWithdrawalRequest } from '~/types'

export function useWithdrawalService() {
  const { apiFetch } = useApi()

  async function listWithdrawals(params: ListWithdrawalsParams = {}): Promise<PaginatedResponse<WithdrawalListItem>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.status) query.set('status', params.status)
    const qs = query.toString()
    return apiFetch<PaginatedResponse<WithdrawalListItem>>(`/withdrawals${qs ? `?${qs}` : ''}`)
  }

  async function updateWithdrawal(id: string, data: UpdateWithdrawalRequest) {
    return apiFetch<{ success: true; withdrawal: WithdrawalListItem }>(`/withdrawals/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  return { listWithdrawals, updateWithdrawal }
}
