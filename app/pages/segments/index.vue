<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20

const queryParams = computed(() => ({
  page: page.value,
  perPage,
}))

const { data, isPending, isError, error } = useSegmentsQuery(queryParams)
const deleteMutation = useDeleteSegment()

const segments = computed(() => data.value?.segments || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

const toast = useToast()
const deleteTarget = ref<string | null>(null)

function confirmDelete(id: string) {
  deleteTarget.value = id
}
function cancelDelete() {
  deleteTarget.value = null
}
function executeDelete() {
  if (!deleteTarget.value) return
  deleteMutation.mutate(deleteTarget.value, {
    onSuccess: () => {
      toast.add({ title: 'Segment deleted', color: 'success' })
      deleteTarget.value = null
    },
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Segments</h1>
      <NuxtLink to="/segments/create">
        <UButton color="primary" icon="i-lucide-plus" size="sm">Create Segment</UButton>
      </NuxtLink>
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load segments' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <TablesTableSkeleton v-if="isPending" :cols="5" :rows="4" />

      <div v-else-if="!segments.length" class="px-5 py-16 text-center">
        <UIcon name="i-lucide-filter" class="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">No segments yet</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Create a segment to target specific users.</p>
        <NuxtLink to="/segments/create">
          <UButton variant="outline" size="xs" icon="i-lucide-plus">Create Segment</UButton>
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Name</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Status</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Created</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in segments" :key="s.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3">
                <NuxtLink :to="`/segments/${s.id}/edit`" class="font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400">
                  {{ s.name }}
                </NuxtLink>
                <p v-if="s.description" class="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{{ s.description }}</p>
              </td>
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400">{{ s.segment_type || '—' }}</td>
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
                  <UButton variant="ghost" size="xs" color="error" icon="i-lucide-trash-2" @click="confirmDelete(s.id)" />
                </div>
              </td>
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

    <UModal :open="!!deleteTarget" @close="cancelDelete">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Segment</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Are you sure? This action cannot be undone.</p>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" @click="cancelDelete">Cancel</UButton>
            <UButton color="error" :loading="deleteMutation.isPending.value" @click="executeDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
