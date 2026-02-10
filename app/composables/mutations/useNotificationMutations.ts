import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SendNotificationRequest } from '~/types'

export function useSendNotification() {
  const { sendNotification } = useNotificationService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendNotificationRequest) => sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
