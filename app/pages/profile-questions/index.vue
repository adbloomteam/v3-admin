<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, isPending, isError, error } = useProfileQuestionsQuery()
const deleteMutation = useDeleteProfileQuestion()

const questions = computed(() => data.value?.data || [])

function deleteQuestion(id: string) {
  if (!confirm('Delete this question?')) return
  deleteMutation.mutate(id, {
    onError: (err: any) => alert(err?.message || 'Failed to delete question'),
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
      <div v-if="isPending" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!questions.length" class="px-5 py-12 text-center text-sm text-zinc-400">No profile questions</div>

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
                  <UButton variant="ghost" size="xs" color="error" icon="i-lucide-trash-2" @click="deleteQuestion(q.id)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
