<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const missions = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const perPage = 20
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
]

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Affiliate', value: 'affiliate' },
  { label: 'Survey', value: 'survey' },
  { label: 'CPG', value: 'cpg' },
  { label: 'Digital Review', value: 'digital_review' },
  { label: 'UGC', value: 'ugc' },
  { label: 'Focus Group', value: 'focus_group' },
]

async function loadMissions() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ page: String(page.value), perPage: String(perPage) })
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (typeFilter.value) params.set('type', typeFilter.value)
    const res = await apiFetch<any>(`/missions?${params}`)
    missions.value = res.data || []
    total.value = res.count || 0
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load missions'
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.ceil(total.value / perPage))

watch([statusFilter, typeFilter], () => { page.value = 1; loadMissions() })

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; loadMissions() }, 300)
})

watch(page, loadMissions)
onMounted(loadMissions)

async function deleteMission(id: string) {
  if (!confirm('Delete this mission?')) return
  try {
    await apiFetch(`/missions/${id}`, { method: 'DELETE' })
    loadMissions()
  } catch (e: any) {
    alert(e?.data?.error || 'Failed to delete mission')
  }
}

async function updateStatus(id: string, status: string) {
  try {
    await apiFetch(`/missions/${id}/status`, { method: 'PATCH', body: { status } })
    loadMissions()
  } catch (e: any) {
    alert(e?.data?.error || 'Failed to update status')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Missions</h1>
      <NuxtLink to="/missions/create">
        <UButton color="primary" icon="i-lucide-plus" size="sm">Create Mission</UButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Search missions..." icon="i-lucide-search" class="w-64" size="sm" />
      <USelect v-model="statusFilter" :items="statusOptions" value-key="value" class="w-40" size="sm" />
      <USelect v-model="typeFilter" :items="typeOptions" value-key="value" class="w-40" size="sm" />
    </div>

    <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{{ error }}</div>

    <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!missions.length" class="px-5 py-12 text-center text-sm text-zinc-400">
        No missions found
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Mission</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Reward</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Participants</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in missions" :key="m.id" class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
              <td class="px-5 py-3">
                <NuxtLink :to="`/missions/${m.id}/edit`" class="font-medium text-zinc-900 hover:text-rose-600">
                  {{ m.title }}
                </NuxtLink>
                <p class="text-xs text-zinc-400 mt-0.5">{{ m.brand_name || '—' }}</p>
              </td>
              <td class="px-5 py-3">
                <span class="text-sm">{{ missionTypeEmoji[m.mission_type] || '' }} {{ m.mission_type }}</span>
              </td>
              <td class="px-5 py-3">
                <UBadge :color="(statusColor[m.status] as any) || 'neutral'" variant="subtle" size="sm">
                  {{ m.status }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right font-medium">{{ formatCurrency(m.reward_amount) }}</td>
              <td class="px-5 py-3 text-right text-zinc-500">
                {{ m.current_participants }}{{ m.max_participants ? ` / ${m.max_participants}` : '' }}
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    v-if="m.status === 'draft'"
                    variant="ghost" size="xs" color="success"
                    icon="i-lucide-play" title="Activate"
                    @click="updateStatus(m.id, 'active')"
                  />
                  <UButton
                    v-if="m.status === 'active'"
                    variant="ghost" size="xs" color="warning"
                    icon="i-lucide-pause" title="Pause"
                    @click="updateStatus(m.id, 'paused')"
                  />
                  <UButton
                    v-if="m.status === 'paused'"
                    variant="ghost" size="xs" color="success"
                    icon="i-lucide-play" title="Resume"
                    @click="updateStatus(m.id, 'active')"
                  />
                  <NuxtLink :to="`/missions/${m.id}/edit`">
                    <UButton variant="ghost" size="xs" icon="i-lucide-pencil" title="Edit" />
                  </NuxtLink>
                  <UButton
                    variant="ghost" size="xs" color="error"
                    icon="i-lucide-trash-2" title="Delete"
                    @click="deleteMission(m.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
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
