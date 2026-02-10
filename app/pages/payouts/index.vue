<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20
const minBalance = ref('')
const debouncedMinBalance = refDebounced(minBalance, 300)

const queryParams = computed(() => ({
  page: page.value,
  perPage,
  minBalance: debouncedMinBalance.value || undefined,
}))

const { data, isPending, isError, error } = usePayoutsQuery(queryParams)

const payouts = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(debouncedMinBalance, () => { page.value = 1 })

async function exportCsv() {
  try {
    const config = useRuntimeConfig()
    const token = useCookie('admin_auth_token').value
    const params = new URLSearchParams()
    if (minBalance.value) params.set('minBalance', minBalance.value)
    const res = await fetch(`${config.public.apiBaseUrl}/api/v1/admin/payouts/export/csv?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payouts-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Failed to export CSV')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Payouts</h1>
      <UButton variant="outline" size="sm" icon="i-lucide-download" @click="exportCsv">Export CSV</UButton>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="minBalance" placeholder="Min balance (cents)..." icon="i-lucide-filter" class="w-52" size="sm" type="number" />
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load payouts' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div v-if="isPending" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!payouts.length" class="px-5 py-12 text-center text-sm text-zinc-400">No eligible payouts found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">User</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Available Credits</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payouts" :key="p.user_id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3">
                <NuxtLink :to="`/users/${p.user_id}`" class="font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400">
                  {{ p.profiles?.email || p.user_id?.slice(0, 8) }}
                </NuxtLink>
                <p class="text-xs text-zinc-400 mt-0.5">
                  {{ [p.profiles?.first_name, p.profiles?.last_name].filter(Boolean).join(' ') || '—' }}
                </p>
              </td>
              <td class="px-5 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(p.available_credits) }}</td>
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
