import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = useState<any>('admin_user', () => null)
  const isLoggedIn = computed(() => !!useCookie('admin_auth_token').value)

  // NOTE: useApi() is called lazily inside each method (not at setup level)
  // to avoid SSR crashes when the store is initialized from middleware context
  // where Nuxt composable context (useRuntimeConfig, useCookie) may not be available.

  async function login(email: string, password: string) {
    const { rawFetch } = useApi()
    const result = await rawFetch<any>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (result.session?.access_token) {
      useCookie('admin_auth_token', { maxAge: 60 * 60 * 24 * 7 }).value = result.session.access_token
      if (result.session.refresh_token) {
        useCookie('admin_refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = result.session.refresh_token
      }
      user.value = result.user || null
    }
    return result
  }

  async function fetchUser(explicitToken?: string) {
    const config = useRuntimeConfig()
    const token = explicitToken || useCookie('admin_auth_token').value
    if (!token) {
      user.value = null
      return null
    }
    try {
      const result = await $fetch<any>('/client/user/me', {
        baseURL: config.public.apiBaseUrl + '/api/v1',
        headers: { Authorization: `Bearer ${token}` },
      })
      user.value = result
      return result
    } catch {
      user.value = null
      return null
    }
  }

  async function logout() {
    const { rawFetch } = useApi()
    try {
      await rawFetch('/auth/logout', { method: 'POST' })
    } catch {
      // Clear local state regardless
    }
    useCookie('admin_auth_token').value = null
    useCookie('admin_refresh_token').value = null
    user.value = null
    navigateTo('/login')
  }

  async function initAuth() {
    const token = useCookie('admin_auth_token')
    if (token.value && !user.value) {
      await fetchUser(token.value)
    }
  }

  return { user, isLoggedIn, login, logout, fetchUser, initAuth }
})
