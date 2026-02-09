export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
    const token = useCookie('admin_auth_token').value
    return $fetch<T>(path, {
      baseURL,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
  }

  return { apiFetch }
}
