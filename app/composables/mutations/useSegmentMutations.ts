import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreateSegmentRequest, UpdateSegmentRequest } from '~/types'

export function useCreateSegment() {
  const { createSegment } = useSegmentService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSegmentRequest) => createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })
}

export function useUpdateSegment() {
  const { updateSegment } = useSegmentService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateSegmentRequest }) => updateSegment(vars.id, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['segment', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })
}

export function useDeleteSegment() {
  const { deleteSegment } = useSegmentService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })
}
