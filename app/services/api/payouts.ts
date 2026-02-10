import type { PaginatedResponse, PayoutListItem, ListPayoutsParams } from '~/types'

export function usePayoutService() {
  const { apiFetch } = useApi()

  async function listPayouts(params: ListPayoutsParams = {}): Promise<PaginatedResponse<PayoutListItem>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.minBalance) query.set('minBalance', String(params.minBalance))
    const qs = query.toString()
    return apiFetch<PaginatedResponse<PayoutListItem>>(`/payouts${qs ? `?${qs}` : ''}`)
  }

  async function exportPayoutsCsv(): Promise<string> {
    return apiFetch<string>('/payouts/export/csv', { responseType: 'text' as any })
  }

  return { listPayouts, exportPayoutsCsv }
}
