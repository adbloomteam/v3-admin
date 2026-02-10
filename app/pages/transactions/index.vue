<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20
const search = ref('')
const debouncedSearch = refDebounced(search, 300)
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

const queryParams = computed(() => ({
  page: page.value,
  perPage,
  search: debouncedSearch.value || undefined,
  type: typeFilter.value || undefined,
}))

const { data, isPending, isError, error } = useTransactionsQuery(queryParams)

const transactions = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(typeFilter, () => { page.value = 1 })
watch(debouncedSearch, () => { page.value = 1 })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Transactions</h1>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Search by email or description..." icon="i-lucide-search" class="w-72" size="sm" />
      <USelect v-model="typeFilter" :items="typeOptions" value-key="value" class="w-44" size="sm" />
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load transactions' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div v-if="isPending" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!transactions.length" class="px-5 py-12 text-center text-sm text-zinc-400">No transactions found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">User</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Description</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Amount</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3">
                <NuxtLink v-if="tx.user_id" :to="`/users/${tx.user_id}`" class="text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs font-mono">
                  {{ tx.user_id.slice(0, 8) }}...
                </NuxtLink>
                <span v-else class="text-zinc-400">—</span>
              </td>
              <td class="px-5 py-3">
                <UBadge color="neutral" variant="subtle" size="sm">{{ tx.transaction_type }}</UBadge>
              </td>
              <td class="px-5 py-3 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">{{ tx.description || '—' }}</td>
              <td class="px-5 py-3 text-right font-medium" :class="tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                {{ formatCurrency(tx.amount) }}
              </td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDate(tx.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <p class="text-xs text-zinc-400">{{ total }} total</p>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="page--" />
          <span class="text-xs text-zinc-500 dark:text-zinc-400 px-2">{{ page }} / {{ totalPages }}</span>
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-right" :disabled="page >= totalPages" @click="page++" />
        </div>
      </div>
    </div>
  </div>
</template>
