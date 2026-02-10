import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = config.public.sentryDsn as string

  if (!dsn) return

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    environment: import.meta.dev ? 'development' : 'production',
    tracesSampleRate: 0.1,
  })

  nuxtApp.hook('vue:error', (error) => {
    Sentry.captureException(error)
  })

  return {
    provide: {
      sentry: Sentry,
    },
  }
})
