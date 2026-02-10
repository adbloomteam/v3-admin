<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.error || e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-zinc-900">ShopperArmy</h1>
        <p class="text-sm text-zinc-500 mt-1">Admin Panel</p>
      </div>

      <div class="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-zinc-900 mb-6">Sign in</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@shopperarmy.com"
              required
              autofocus
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="password"
              type="password"
              placeholder="Enter password"
              required
              size="lg"
              class="w-full"
            />
          </UFormField>

          <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {{ error }}
          </div>

          <UButton
            type="submit"
            :loading="loading"
            block
            size="lg"
            color="primary"
          >
            Sign In
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
