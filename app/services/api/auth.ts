import type { AuthSession, ApiSuccess, Profile } from '~/types'

export function useAuthService() {
  const { rawFetch } = useApi()

  async function login(data: { email: string; password: string }): Promise<AuthSession> {
    return rawFetch<AuthSession>('/auth/login', { method: 'POST', body: data })
  }

  async function logout(): Promise<ApiSuccess> {
    return rawFetch<ApiSuccess>('/auth/logout', { method: 'POST' })
  }

  async function fetchUser(): Promise<{ profile: Profile }> {
    return rawFetch<{ profile: Profile }>('/client/me')
  }

  return { login, logout, fetchUser }
}
