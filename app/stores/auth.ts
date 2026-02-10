import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = useState<any>('admin_user', () => null)
  const isLoggedIn = computed(() => !!useCookie('admin_auth_token').value)
  const { rawFetch } = useApi()

  async function login(email: string, password: string) {
    const result = await rawFetch<any>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (result.session?.access_token) {
      useCookie('admin_auth_token', { maxAge: 60 * 60 * 24 * 7 }).value = result.session.access_token
      user.value = result.user || null
    }
    return result
  }

  async function fetchUser() {
    try {
      const result = await rawFetch<any>('/client/user/me')
      user.value = result
      return result
    } catch {
      user.value = null
      return null
    }
  }

  async function logout() {
    try {
      await rawFetch('/auth/logout', { method: 'POST' })
    } catch {
      // Clear local state regardless
    }
    useCookie('admin_auth_token').value = null
    user.value = null
    navigateTo('/login')
  }

  async function initAuth() {
    const token = useCookie('admin_auth_token')
    if (token.value && !user.value) {
      await fetchUser()
    }
  }

  return { user, isLoggedIn, login, logout, fetchUser, initAuth }
})
