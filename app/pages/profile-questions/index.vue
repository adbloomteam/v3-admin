<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, isPending, isError, error } = useProfileQuestionsQuery()
const deleteMutation = useDeleteProfileQuestion()

const questions = computed(() => data.value?.data || [])

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
      toast.add({ title: 'Question deleted', color: 'success' })
      deleteTarget.value = null
    },
  })
}

const questionTypeLabel: Record<string, string> = {
  text: 'Text',
  single_select: 'Select',
  multi_select: 'Multi Select',
  number: 'Number',
  date: 'Date',
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Profile Questions</h1>
      <NuxtLink to="/profile-questions/create">
        <UButton color="primary" icon="i-lucide-plus" size="sm">Add Question</UButton>
      </NuxtLink>
    </div>

    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load profile questions' }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <TablesTableSkeleton v-if="isPending" :cols="6" :rows="4" />

      <div v-else-if="!questions.length" class="px-5 py-16 text-center">
        <UIcon name="i-lucide-list-checks" class="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">No profile questions yet</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Add questions to collect user demographics.</p>
        <NuxtLink to="/profile-questions/create">
          <UButton variant="outline" size="xs" icon="i-lucide-plus">Add Question</UButton>
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Order</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Question</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Key</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Required</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400">{{ q.sort_order ?? '—' }}</td>
              <td class="px-5 py-3">
                <NuxtLink :to="`/profile-questions/${q.id}/edit`" class="font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400">
                  {{ q.question_text }}
                </NuxtLink>
              </td>
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{{ q.question_key }}</td>
              <td class="px-5 py-3">
                <UBadge color="neutral" variant="subtle" size="sm">{{ questionTypeLabel[q.question_type] || q.question_type }}</UBadge>
              </td>
              <td class="px-5 py-3">
                <UBadge :color="q.is_required ? 'warning' : 'neutral'" variant="subtle" size="sm">
                  {{ q.is_required ? 'Required' : 'Optional' }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/profile-questions/${q.id}/edit`">
                    <UButton variant="ghost" size="xs" icon="i-lucide-pencil" />
                  </NuxtLink>
                  <UButton variant="ghost" size="xs" color="error" icon="i-lucide-trash-2" @click="confirmDelete(q.id)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UModal :open="!!deleteTarget" @close="cancelDelete">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Question</h3>
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
