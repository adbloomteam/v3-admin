<script setup lang="ts">
import * as Sentry from '@sentry/vue'

interface Props {
  fallback?: boolean
  onError?: (error: Error, instance: any, info: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: true,
})

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')

onErrorCaptured((error: Error, instance, info) => {
  console.error('[ErrorBoundary] Caught error:', error)

  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  errorStack.value = error.stack || ''

  // Log to Sentry
  Sentry.captureException(error, {
    contexts: {
      vue: {
        componentName: instance?.$options?.name || 'Unknown',
        info,
      },
    },
  })

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error, instance, info)
  }

  // Prevent error from propagating
  return false
})

function reset() {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

function reload() {
  window.location.reload()
}
</script>

<template>
  <div>
    <!-- Error Fallback UI -->
    <div v-if="hasError && fallback" class="min-h-[400px] flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <div class="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-alert-triangle" class="size-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Something went wrong</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {{ errorMessage }}
        </p>
        <div class="flex gap-3 justify-center">
          <UButton variant="outline" @click="reset">Try Again</UButton>
          <UButton color="primary" @click="reload">Reload Page</UButton>
        </div>
        <details v-if="errorStack" class="mt-6 text-left">
          <summary class="text-xs text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
            Show error details
          </summary>
          <pre class="mt-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 overflow-auto max-h-40">{{ errorStack }}</pre>
        </details>
      </div>
    </div>

    <!-- Normal Content -->
    <slot v-else />
  </div>
</template>
