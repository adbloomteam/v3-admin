<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string
const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const data = ref<any>(null)

const creditForm = reactive({ amount: 0, type: 'credit' as 'credit' | 'debit', reason: '' })
const crediting = ref(false)
const creditError = ref('')
const creditSuccess = ref('')

onMounted(async () => {
  try {
    data.value = await apiFetch<any>(`/users/${id}`)
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load user'
  } finally {
    loading.value = false
  }
})

const creditTypeOptions = [
  { label: 'Credit (add)', value: 'credit' },
  { label: 'Debit (subtract)', value: 'debit' },
]

async function adjustCredits() {
  crediting.value = true
  creditError.value = ''
  creditSuccess.value = ''
  try {
    await apiFetch(`/users/${id}/credits`, {
      method: 'POST',
      body: { amount: creditForm.amount, type: creditForm.type, reason: creditForm.reason },
    })
    creditSuccess.value = `Successfully ${creditForm.type === 'credit' ? 'credited' : 'debited'} ${formatCurrency(creditForm.amount * 100)}`
    creditForm.amount = 0
    creditForm.reason = ''
    // Reload user data
    data.value = await apiFetch<any>(`/users/${id}`)
  } catch (e: any) {
    creditError.value = e?.data?.error || 'Failed to adjust credits'
  } finally {
    crediting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/users">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">User Detail</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <div v-else-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>

    <template v-else-if="data">
      <!-- Profile card -->
      <div class="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-zinc-900">{{ data.profile.email }}</h2>
            <p class="text-sm text-zinc-500 mt-1">
              {{ [data.profile.first_name, data.profile.last_name].filter(Boolean).join(' ') || 'No name' }}
            </p>
          </div>
          <UBadge :color="data.profile.role === 'admin' || data.profile.role === 'super_admin' ? 'warning' : 'neutral'" variant="subtle">
            {{ data.profile.role }}
          </UBadge>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <p class="text-xs text-zinc-500">Phone</p>
            <p class="text-sm font-medium">{{ data.profile.phone || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-zinc-500">Location</p>
            <p class="text-sm font-medium">{{ [data.profile.state, data.profile.country].filter(Boolean).join(', ') || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-zinc-500">Zipcode</p>
            <p class="text-sm font-medium">{{ data.profile.zipcode || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-zinc-500">Joined</p>
            <p class="text-sm font-medium">{{ formatDate(data.profile.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Wallet -->
      <div class="grid grid-cols-2 gap-4 mb-6" v-if="data.wallet">
        <div class="bg-white rounded-xl border border-zinc-200 p-4 text-center">
          <p class="text-xl font-bold text-emerald-600">{{ formatCurrency(data.wallet.available_credits) }}</p>
          <p class="text-xs text-zinc-500">Available</p>
        </div>
        <div class="bg-white rounded-xl border border-zinc-200 p-4 text-center">
          <p class="text-xl font-bold text-zinc-700">{{ formatCurrency(data.wallet.lifetime_earned) }}</p>
          <p class="text-xs text-zinc-500">Lifetime Earned</p>
        </div>
      </div>

      <!-- Adjust Credits -->
      <div class="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h3 class="text-base font-semibold mb-4">Adjust Credits</h3>
        <form @submit.prevent="adjustCredits" class="flex flex-wrap items-end gap-3">
          <UFormField label="Amount ($)">
            <UInput v-model.number="creditForm.amount" type="number" step="0.01" min="0.01" class="w-32" size="sm" required />
          </UFormField>
          <UFormField label="Type">
            <USelect v-model="creditForm.type" :items="creditTypeOptions" value-key="value" class="w-40" size="sm" />
          </UFormField>
          <UFormField label="Reason">
            <UInput v-model="creditForm.reason" placeholder="Optional reason" class="w-48" size="sm" />
          </UFormField>
          <UButton type="submit" color="primary" size="sm" :loading="crediting">Apply</UButton>
        </form>
        <div v-if="creditError" class="text-sm text-red-600 mt-2">{{ creditError }}</div>
        <div v-if="creditSuccess" class="text-sm text-emerald-600 mt-2">{{ creditSuccess }}</div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-xl border border-zinc-200 mb-6">
        <div class="px-5 py-4 border-b border-zinc-100">
          <h3 class="text-base font-semibold">Recent Transactions</h3>
        </div>
        <div v-if="!data.creditTransactions?.length" class="px-5 py-8 text-center text-sm text-zinc-400">
          No transactions
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-100">
                <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in data.creditTransactions" :key="tx.id" class="border-b border-zinc-50 last:border-0">
                <td class="px-5 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                    {{ tx.transaction_type }}
                  </span>
                </td>
                <td class="px-5 py-3 text-zinc-600">{{ tx.description || '—' }}</td>
                <td class="px-5 py-3 text-right font-medium" :class="tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(tx.amount) }}
                </td>
                <td class="px-5 py-3 text-right text-zinc-400">{{ formatDate(tx.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Events -->
      <div class="bg-white rounded-xl border border-zinc-200">
        <div class="px-5 py-4 border-b border-zinc-100">
          <h3 class="text-base font-semibold">Recent Events</h3>
        </div>
        <div v-if="!data.events?.length" class="px-5 py-8 text-center text-sm text-zinc-400">No events</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-100">
                <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Event</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in data.events" :key="ev.id" class="border-b border-zinc-50 last:border-0">
                <td class="px-5 py-3 text-zinc-700">{{ ev.event_type }}</td>
                <td class="px-5 py-3 text-right text-zinc-400">{{ formatDateTime(ev.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
