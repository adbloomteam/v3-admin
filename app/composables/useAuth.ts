export function useAuth() {
  const user = useState<any>('admin_user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const { apiFetch } = useApi()

  async function login(email: string, password: string) {
    const result = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (result.token) {
      useCookie('admin_auth_token').value = result.token
    }
    return result
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' })
    useCookie('admin_auth_token').value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, isLoggedIn, login, logout }
}
