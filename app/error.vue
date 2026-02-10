<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()

const title = computed(() => {
  if (props.error.statusCode === 404) return 'Page not found'
  if (props.error.statusCode === 403) return 'Access denied'
  return 'Something went wrong'
})

const description = computed(() => {
  if (props.error.statusCode === 404) return 'The page you are looking for does not exist or has been moved.'
  if (props.error.statusCode === 403) return 'You do not have permission to access this page.'
  return props.error.message || 'An unexpected error occurred. Please try again.'
})

function handleClear() {
  clearError({ redirect: '/dashboard' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
    <div class="text-center max-w-md">
      <p class="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">{{ error.statusCode }}</p>
      <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{{ title }}</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8">{{ description }}</p>
      <UButton color="primary" size="lg" @click="handleClear">Go to Dashboard</UButton>
    </div>
  </div>
</template>
