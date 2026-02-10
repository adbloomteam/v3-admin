import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UpdateWithdrawalRequest } from '~/types'

export function useUpdateWithdrawal() {
  const { updateWithdrawal } = useWithdrawalService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateWithdrawalRequest }) => updateWithdrawal(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
