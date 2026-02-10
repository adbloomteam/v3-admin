import { VueQueryPlugin, QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxtApp.vueApp.use(VueQueryPlugin, options)
})
