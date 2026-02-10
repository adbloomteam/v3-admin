import type { PaginatedResponse, NotificationSend, SendNotificationRequest, SendNotificationResult } from '~/types'

export function useNotificationService() {
  const { apiFetch } = useApi()

  async function sendNotification(data: SendNotificationRequest): Promise<SendNotificationResult> {
    return apiFetch<SendNotificationResult>('/notifications/send', { method: 'POST', body: data })
  }

  async function listNotifications(params: { page?: number; perPage?: number } = {}): Promise<PaginatedResponse<NotificationSend>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    const qs = query.toString()
    return apiFetch<PaginatedResponse<NotificationSend>>(`/notifications${qs ? `?${qs}` : ''}`)
  }

  return { sendNotification, listNotifications }
}
