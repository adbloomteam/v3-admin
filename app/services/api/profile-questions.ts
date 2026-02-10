import type { ProfileQuestion, ApiSuccess, CreateProfileQuestionRequest, UpdateProfileQuestionRequest } from '~/types'

export function useProfileQuestionService() {
  const { apiFetch } = useApi()

  async function listQuestions(): Promise<{ data: ProfileQuestion[] }> {
    return apiFetch<{ data: ProfileQuestion[] }>('/profile-questions')
  }

  async function getQuestion(id: string): Promise<{ data: ProfileQuestion }> {
    return apiFetch<{ data: ProfileQuestion }>(`/profile-questions/${id}`)
  }

  async function createQuestion(data: CreateProfileQuestionRequest): Promise<{ data: ProfileQuestion }> {
    return apiFetch<{ data: ProfileQuestion }>('/profile-questions', { method: 'POST', body: data })
  }

  async function updateQuestion(id: string, data: UpdateProfileQuestionRequest): Promise<{ data: ProfileQuestion }> {
    return apiFetch<{ data: ProfileQuestion }>(`/profile-questions/${id}`, { method: 'PATCH', body: data })
  }

  async function deleteQuestion(id: string): Promise<ApiSuccess> {
    return apiFetch<ApiSuccess>(`/profile-questions/${id}`, { method: 'DELETE' })
  }

  return { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion }
}
