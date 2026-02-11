<script setup lang="ts">
import type { Brand } from '~/types'

definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

const queryParams = computed(() => ({
  page: page.value,
  perPage,
  search: debouncedSearch.value || undefined,
}))

const { data, isPending, isError, error } = useBrandsQuery(queryParams)
const deleteMutation = useDeleteBrand()

const brands = computed(() => data.value?.data || [])
const total = computed(() => data.value?.count || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(debouncedSearch, () => { page.value = 1 })

const toast = useToast()
const deleteTarget = ref<string | null>(null)
const modalOpen = ref(false)
const editBrand = ref<Brand | null>(null)

function openCreate() {
  editBrand.value = null
  modalOpen.value = true
}

function openEdit(brand: Brand) {
  editBrand.value = brand
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editBrand.value = null
}

function onSaved() {
  toast.add({ title: editBrand.value ? 'Brand updated' : 'Brand created', color: 'success' })
  closeModal()
}

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
      toast.add({ title: 'Brand deleted', color: 'success' })
      deleteTarget.value = null
    },
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-(--ui-text)">Brands</h1>
      <UButton color="primary" icon="i-lucide-plus" size="sm" @click="openCreate">Create Brand</UButton>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Search brands..." icon="i-lucide-search" class="w-full sm:w-64" size="sm" />
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load brands' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <TablesTableSkeleton v-if="isPending" :cols="5" :rows="5" />

      <div v-else-if="!brands.length" class="px-5 py-16 text-center">
        <UIcon name="i-lucide-building-2" class="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">No brands found</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Create your first brand to get started.</p>
        <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="openCreate">Create Brand</UButton>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Brand</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Website</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">External ID</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Created</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in brands" :key="b.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="b.logo_url"
                    :src="b.logo_url"
                    :alt="b.name"
                    class="w-8 h-8 rounded-md object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  />
                  <div v-else class="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-building-2" class="size-4 text-zinc-400" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ b.name }}</p>
                    <p v-if="b.description" class="text-xs text-zinc-400 truncate max-w-xs">{{ b.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                <a v-if="b.website_url" :href="b.website_url" target="_blank" rel="noopener" class="text-sm hover:text-rose-500 truncate max-w-40 block">
                  {{ b.website_url.replace(/^https?:\/\//, '') }}
                </a>
                <span v-else class="text-zinc-300 dark:text-zinc-600">—</span>
              </td>
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                <span class="font-mono text-xs">{{ b.external_affiliate_id || '—' }}</span>
              </td>
              <td class="px-5 py-3 text-zinc-400 text-xs">
                {{ new Date(b.created_at).toLocaleDateString() }}
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    variant="ghost" size="xs"
                    icon="i-lucide-pencil" title="Edit"
                    @click="openEdit(b)"
                  />
                  <UButton
                    variant="ghost" size="xs" color="error"
                    icon="i-lucide-trash-2" title="Delete"
                    @click="confirmDelete(b.id)"
                  />
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

    <!-- Create/Edit Modal -->
    <BrandFormModal
      :open="modalOpen"
      :brand="editBrand"
      @close="closeModal"
      @saved="onSaved"
    />

    <!-- Delete Confirmation -->
    <UModal :open="!!deleteTarget" @close="cancelDelete">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold text-(--ui-text)">Delete Brand</h3>
          <p class="text-sm text-(--ui-text-muted)">Are you sure you want to delete this brand? Missions linked to it will keep their current brand info but lose the association.</p>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" @click="cancelDelete">Cancel</UButton>
            <UButton color="error" :loading="deleteMutation.isPending.value" @click="executeDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
