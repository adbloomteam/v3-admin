<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const stats = ref<any>(null)

onMounted(async () => {
  try {
    stats.value = await apiFetch('/dashboard/stats')
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
})

const cards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Total Users', value: stats.value.totalUsers?.toLocaleString() ?? '0', icon: 'i-lucide-users' },
    { label: 'Active Missions', value: stats.value.activeMissions?.toLocaleString() ?? '0', icon: 'i-lucide-target' },
    { label: 'Conversions (7d)', value: stats.value.conversionsLast7Days?.toLocaleString() ?? '0', icon: 'i-lucide-trending-up' },
    { label: 'Conversions (30d)', value: stats.value.conversionsLast30Days?.toLocaleString() ?? '0', icon: 'i-lucide-bar-chart-3' },
    { label: 'Total Credits Issued', value: formatCurrency(stats.value.totalCreditsIssued ?? 0), icon: 'i-lucide-coins' },
  ]
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <div v-else-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
      {{ error }}
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <div
          v-for="card in cards"
          :key="card.label"
          class="bg-white rounded-xl border border-zinc-200 p-5"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="size-9 rounded-lg bg-zinc-100 flex items-center justify-center">
              <UIcon :name="card.icon" class="size-4 text-zinc-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-zinc-900">{{ card.value }}</p>
          <p class="text-sm text-zinc-500 mt-1">{{ card.label }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-zinc-200">
        <div class="px-5 py-4 border-b border-zinc-100">
          <h2 class="text-base font-semibold text-zinc-900">Recent Transactions</h2>
        </div>
        <div v-if="!stats.recentTransactions?.length" class="px-5 py-8 text-center text-sm text-zinc-400">
          No recent transactions
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
              <tr
                v-for="tx in stats.recentTransactions"
                :key="tx.id"
                class="border-b border-zinc-50 last:border-0"
              >
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
    </template>
  </div>
</template>
