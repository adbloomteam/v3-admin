import type { AdminUserListItem, AdminUserDetail, AdjustCreditsRequest, ListUsersParams } from '~/types'

export function useUserService() {
  const { apiFetch } = useApi()

  async function listUsers(params: ListUsersParams = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.search) query.set('search', params.search)
    if (params.role) query.set('role', params.role)
    const qs = query.toString()
    return apiFetch<{ users: AdminUserListItem[]; total: number; page: number; perPage: number }>(`/users${qs ? `?${qs}` : ''}`)
  }

  async function getUser(id: string): Promise<AdminUserDetail> {
    return apiFetch<AdminUserDetail>(`/users/${id}`)
  }

  async function adjustCredits(userId: string, data: AdjustCreditsRequest) {
    return apiFetch<{ success: true; transactionId: string }>(`/users/${userId}/credits`, { method: 'POST', body: data })
  }

  async function exportUsersCsv() {
    return apiFetch<string>('/users/export/csv', { responseType: 'text' as any })
  }

  return { listUsers, getUser, adjustCredits, exportUsersCsv }
}
