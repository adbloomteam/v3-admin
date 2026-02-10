/**
 * Admin auth composable — delegates to Pinia auth store.
 * Kept for backward compatibility during migration. New code should use useAuthStore() directly.
 */
export function useAuth() {
  const store = useAuthStore()

  return {
    user: store.user,
    isLoggedIn: store.isLoggedIn,
    login: store.login,
    logout: store.logout,
    fetchUser: store.fetchUser,
  }
}
