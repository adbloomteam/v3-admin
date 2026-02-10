<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const transactions = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const perPage = 20
const search = ref('')
const typeFilter = ref('')

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Mission Reward', value: 'mission_reward' },
  { label: 'Referral Bonus', value: 'referral_bonus' },
  { label: 'Admin Credit', value: 'admin_credit' },
  { label: 'Admin Debit', value: 'admin_debit' },
  { label: 'Payout', value: 'payout' },
  { label: 'Conversion', value: 'conversion' },
]

async function loadTransactions() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ page: String(page.value), perPage: String(perPage) })
    if (search.value) params.set('search', search.value)
    if (typeFilter.value) params.set('type', typeFilter.value)
    const res = await apiFetch<any>(`/transactions?${params}`)
    transactions.value = res.data || []
    total.value = res.total || 0
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load transactions'
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(typeFilter, () => { page.value = 1; loadTransactions() })

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; loadTransactions() }, 300)
})

watch(page, loadTransactions)
onMounted(loadTransactions)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Transactions</h1>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Search by email or description..." icon="i-lucide-search" class="w-72" size="sm" />
      <USelect v-model="typeFilter" :items="typeOptions" value-key="value" class="w-44" size="sm" />
    </div>

    <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{{ error }}</div>

    <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!transactions.length" class="px-5 py-12 text-center text-sm text-zinc-400">No transactions found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">User</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Amount</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id" class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
              <td class="px-5 py-3">
                <NuxtLink v-if="tx.user_id" :to="`/users/${tx.user_id}`" class="text-zinc-900 hover:text-rose-600 font-medium">
                  {{ tx.profiles?.email || tx.user_id?.slice(0, 8) }}
                </NuxtLink>
                <span v-else class="text-zinc-400">—</span>
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                  {{ tx.transaction_type }}
                </span>
              </td>
              <td class="px-5 py-3 text-zinc-600 max-w-xs truncate">{{ tx.description || '—' }}</td>
              <td class="px-5 py-3 text-right font-medium" :class="tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ formatCurrency(tx.amount) }}
              </td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDate(tx.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
        <p class="text-xs text-zinc-400">{{ total }} total</p>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="page--" />
          <span class="text-xs text-zinc-500 px-2">{{ page }} / {{ totalPages }}</span>
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-right" :disabled="page >= totalPages" @click="page++" />
        </div>
      </div>
    </div>
  </div>
</template>
