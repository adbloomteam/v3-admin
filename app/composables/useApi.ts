/**
 * API composable for admin dashboard.
 * Provides apiFetch (scoped to /api/v1/admin) and rawFetch (for auth endpoints).
 * Includes automatic token refresh on 401 responses.
 */

let refreshPromise: Promise<boolean> | null = null

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  /** Try to refresh the access token using the stored refresh token */
  async function refreshToken(): Promise<boolean> {
    const rt = useCookie('admin_refresh_token').value
    if (!rt) return false

    try {
      const result = await $fetch<any>('/auth/refresh', {
        baseURL: baseURL + '/api/v1',
        method: 'POST',
        body: { refresh_token: rt },
      })

      if (result.session?.access_token) {
        useCookie('admin_auth_token', { maxAge: 60 * 60 * 24 * 7 }).value = result.session.access_token
        if (result.session.refresh_token) {
          useCookie('admin_refresh_token', { maxAge: 60 * 60 * 24 * 30 }).value = result.session.refresh_token
        }
        return true
      }
    } catch {
      // Refresh failed — token is truly dead
    }
    return false
  }

  /** Deduplicated refresh — multiple 401s only trigger one refresh call */
  function doRefresh(): Promise<boolean> {
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => { refreshPromise = null })
    }
    return refreshPromise
  }

  /** Redirect to login and clear tokens */
  function forceLogout() {
    useCookie('admin_auth_token').value = null
    useCookie('admin_refresh_token').value = null
    if (import.meta.client) {
      navigateTo('/login')
    }
  }

  /** Execute a fetch, retry once on 401 after refreshing the token */
  async function fetchWithRefresh<T>(path: string, fetchBaseURL: string, options: any = {}): Promise<T> {
    const token = useCookie('admin_auth_token').value
    try {
      return await $fetch<T>(path, {
        baseURL: fetchBaseURL,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      })
    } catch (err: any) {
      // Only attempt refresh on 401, and only on client side
      if (err?.status === 401 && import.meta.client) {
        const refreshed = await doRefresh()
        if (refreshed) {
          // Retry with new token
          const newToken = useCookie('admin_auth_token').value
          return await $fetch<T>(path, {
            baseURL: fetchBaseURL,
            headers: {
              ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
              ...options.headers,
            },
            ...options,
          })
        }
        // Refresh failed — force logout
        forceLogout()
      }
      throw err
    }
  }

  /** Fetch from /api/v1/admin/* — auto-attaches auth token */
  async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
    return fetchWithRefresh<T>(path, baseURL + '/api/v1/admin', options)
  }

  /** Fetch from /api/v1/* — for auth endpoints that aren't under /admin */
  async function rawFetch<T>(path: string, options: any = {}): Promise<T> {
    return fetchWithRefresh<T>(path, baseURL + '/api/v1', options)
  }

  return { apiFetch, rawFetch }
}
