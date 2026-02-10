import { VueQueryPlugin, QueryClient, MutationCache, QueryCache, type VueQueryPluginOptions } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const mutationCache = new MutationCache({
    onError: (error: any) => {
      if (import.meta.client) {
        const toast = useToast()
        const message = error?.data?.error || error?.message || 'Something went wrong'
        toast.add({ title: 'Error', description: message, color: 'error' })
      }
    },
  })

  const queryCache = new QueryCache({
    onError: (error: any, query) => {
      // Only toast on background refetch failures (not initial loads)
      if (import.meta.client && query.state.dataUpdateCount > 0) {
        const toast = useToast()
        const message = error?.data?.error || error?.message || 'Failed to refresh data'
        toast.add({ title: 'Error', description: message, color: 'error' })
      }
    },
  })

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
          // Don't retry 401s — useApi handles token refresh
          if (error?.status === 401) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
      },
    },
    mutationCache,
    queryCache,
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxtApp.vueApp.use(VueQueryPlugin, options)
})
