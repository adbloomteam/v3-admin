<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20
const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const roleFilter = ref('user')

const roleOptions = [
  { label: 'Users', value: 'user' },
  { label: 'Admins', value: 'admin' },
]

const queryParams = computed(() => ({
  page: page.value,
  perPage,
  role: roleFilter.value,
  search: debouncedSearch.value || undefined,
}))

const { data, isPending, isError, error } = useUsersQuery(queryParams)

const users = computed(() => data.value?.users || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(roleFilter, () => { page.value = 1 })
watch(debouncedSearch, () => { page.value = 1 })

async function exportCsv() {
  try {
    const config = useRuntimeConfig()
    const token = useCookie('admin_auth_token').value
    const res = await fetch(`${config.public.apiBaseUrl}/api/v1/admin/users/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
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
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Users</h1>
      <UButton variant="outline" size="sm" icon="i-lucide-download" @click="exportCsv">Export CSV</UButton>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Search by email or name..." icon="i-lucide-search" class="w-full sm:w-72" size="sm" />
      <USelect v-model="roleFilter" :items="roleOptions" value-key="value" class="w-full sm:w-36" size="sm" />
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load users' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div v-if="isPending" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!users.length" class="px-5 py-12 text-center text-sm text-zinc-400">No users found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">User</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Role</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Credits</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3">
                <NuxtLink :to="`/users/${u.id}`" class="font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400">
                  {{ u.email }}
                </NuxtLink>
                <p class="text-xs text-zinc-400 mt-0.5">{{ [u.first_name, u.last_name].filter(Boolean).join(' ') || '—' }}</p>
              </td>
              <td class="px-5 py-3">
                <UBadge :color="u.role === 'admin' || u.role === 'super_admin' ? 'warning' : 'neutral'" variant="subtle" size="sm">
                  {{ u.role }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">{{ formatCurrency(u.available_credits || 0) }}</td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDate(u.created_at) }}</td>
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
