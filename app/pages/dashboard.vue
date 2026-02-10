<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, isPending, isError, error } = useDashboardQuery()

const cards = computed(() => {
  if (!data.value) return []
  return [
    { label: 'Total Users', value: data.value.totalUsers?.toLocaleString() ?? '0', icon: 'i-lucide-users' },
    { label: 'Active Missions', value: data.value.activeMissions?.toLocaleString() ?? '0', icon: 'i-lucide-target' },
    { label: 'Conversions (7d)', value: data.value.conversionsLast7Days?.toLocaleString() ?? '0', icon: 'i-lucide-trending-up' },
    { label: 'Conversions (30d)', value: data.value.conversionsLast30Days?.toLocaleString() ?? '0', icon: 'i-lucide-bar-chart-3' },
    { label: 'Total Credits Issued', value: formatCurrency(data.value.totalCreditsIssued ?? 0), icon: 'i-lucide-coins' },
  ]
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Dashboard</h1>

    <div v-if="isPending" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <div v-else-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
      {{ error?.message || 'Failed to load dashboard' }}
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <div
          v-for="card in cards"
          :key="card.label"
          class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="size-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <UIcon :name="card.icon" class="size-4 text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
          <p class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ card.value }}</p>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ card.label }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Transactions</h2>
        </div>
        <div v-if="!data?.recentTransactions?.length" class="px-5 py-8 text-center text-sm text-zinc-400">
          No recent transactions
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-100 dark:border-zinc-800">
                <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Type</th>
                <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Description</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Amount</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tx in data.recentTransactions"
                :key="tx.id"
                class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
              >
                <td class="px-5 py-3">
                  <UBadge color="neutral" variant="subtle" size="sm">{{ tx.transaction_type }}</UBadge>
                </td>
                <td class="px-5 py-3 text-zinc-600 dark:text-zinc-400">{{ tx.description || '—' }}</td>
                <td class="px-5 py-3 text-right font-medium" :class="tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
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
