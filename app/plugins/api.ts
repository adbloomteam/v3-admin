/**
 * API plugin — initializes auth state on app load.
 * Reads the admin_auth_token cookie and fetches the admin user profile.
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore()
    await authStore.initAuth()
  }
})
