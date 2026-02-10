import { useQuery } from '@tanstack/vue-query'

export function useProfileQuestionsQuery() {
  const { listQuestions } = useProfileQuestionService()

  return useQuery({
    queryKey: ['profile-questions'] as const,
    queryFn: () => listQuestions(),
  })
}

export function useProfileQuestionQuery(id: Ref<string> | string) {
  const { getQuestion } = useProfileQuestionService()
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery({
    queryKey: ['profile-question', resolvedId] as const,
    queryFn: () => getQuestion(toValue(resolvedId)),
    enabled: () => !!toValue(resolvedId),
  })
}
