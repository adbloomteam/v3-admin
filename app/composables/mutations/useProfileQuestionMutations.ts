import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreateProfileQuestionRequest, UpdateProfileQuestionRequest } from '~/types'

export function useCreateProfileQuestion() {
  const { createQuestion } = useProfileQuestionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProfileQuestionRequest) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] })
    },
  })
}

export function useUpdateProfileQuestion() {
  const { updateQuestion } = useProfileQuestionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateProfileQuestionRequest }) => updateQuestion(vars.id, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['profile-question', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] })
    },
  })
}

export function useDeleteProfileQuestion() {
  const { deleteQuestion } = useProfileQuestionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] })
    },
  })
}
