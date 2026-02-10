/**
 * Admin auth composable.
 * Login calls /api/v1/auth/login (NOT /admin/auth).
 * Backend returns { session: { access_token }, user }.
 */
export function useAuth() {
  const user = useState<any>('admin_user', () => null)
  const isLoggedIn = computed(() => !!useCookie('admin_auth_token').value)
  const { rawFetch, apiFetch } = useApi()

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
      // Ignore — clear local state regardless
    }
    useCookie('admin_auth_token').value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, isLoggedIn, login, logout, fetchUser }
}
