<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const segments = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const perPage = 20

async function loadSegments() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<any>(`/segments?page=${page.value}&perPage=${perPage}`)
    segments.value = res.segments || []
    total.value = res.total || 0
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load segments'
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.ceil(total.value / perPage))
watch(page, loadSegments)
onMounted(loadSegments)

async function deleteSegment(id: string) {
  if (!confirm('Delete this segment?')) return
  try {
    await apiFetch(`/segments/${id}`, { method: 'DELETE' })
    loadSegments()
  } catch (e: any) {
    alert(e?.data?.error || 'Failed to delete segment')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Segments</h1>
      <NuxtLink to="/segments/create">
        <UButton color="primary" icon="i-lucide-plus" size="sm">Create Segment</UButton>
      </NuxtLink>
    </div>

    <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{{ error }}</div>

    <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!segments.length" class="px-5 py-12 text-center text-sm text-zinc-400">No segments found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Created</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in segments" :key="s.id" class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
              <td class="px-5 py-3">
                <NuxtLink :to="`/segments/${s.id}/edit`" class="font-medium text-zinc-900 hover:text-rose-600">
                  {{ s.name }}
                </NuxtLink>
                <p v-if="s.description" class="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{{ s.description }}</p>
              </td>
              <td class="px-5 py-3 text-zinc-500">{{ s.segment_type || '—' }}</td>
              <td class="px-5 py-3">
                <UBadge :color="s.is_active ? 'success' : 'neutral'" variant="subtle" size="sm">
                  {{ s.is_active ? 'Active' : 'Inactive' }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDate(s.created_at) }}</td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/segments/${s.id}/edit`">
                    <UButton variant="ghost" size="xs" icon="i-lucide-pencil" />
                  </NuxtLink>
                  <UButton variant="ghost" size="xs" color="error" icon="i-lucide-trash-2" @click="deleteSegment(s.id)" />
                </div>
              </td>
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
