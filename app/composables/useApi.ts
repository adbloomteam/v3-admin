/**
 * API composable for admin dashboard.
 * Provides apiFetch (scoped to /api/v1/admin) and rawFetch (for auth endpoints).
 */
export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  /** Fetch from /api/v1/admin/* — auto-attaches auth token */
  async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
    const token = useCookie('admin_auth_token').value
    return $fetch<T>(path, {
      baseURL: baseURL + '/api/v1/admin',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
  }

  /** Fetch from /api/v1/* — for auth endpoints that aren't under /admin */
  async function rawFetch<T>(path: string, options: any = {}): Promise<T> {
    const token = useCookie('admin_auth_token').value
    return $fetch<T>(path, {
      baseURL: baseURL + '/api/v1',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
  }

  return { apiFetch, rawFetch }
}
