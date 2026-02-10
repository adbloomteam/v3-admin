import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AdjustCreditsRequest } from '~/types'

export function useAdjustCredits() {
  const { adjustCredits } = useUserService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { userId: string; data: AdjustCreditsRequest }) => adjustCredits(vars.userId, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['user', vars.userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
