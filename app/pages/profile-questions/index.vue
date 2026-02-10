<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const loading = ref(true)
const error = ref('')
const questions = ref<any[]>([])

async function loadQuestions() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<any>('/profile-questions')
    questions.value = res.data || []
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load profile questions'
  } finally {
    loading.value = false
  }
}

onMounted(loadQuestions)

async function deleteQuestion(id: string) {
  if (!confirm('Delete this question?')) return
  try {
    await apiFetch(`/profile-questions/${id}`, { method: 'DELETE' })
    loadQuestions()
  } catch (e: any) {
    alert(e?.data?.error || 'Failed to delete question')
  }
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
      <h1 class="text-2xl font-bold">Profile Questions</h1>
      <NuxtLink to="/profile-questions/create">
        <UButton color="primary" icon="i-lucide-plus" size="sm">Add Question</UButton>
      </NuxtLink>
    </div>

    <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{{ error }}</div>

    <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!questions.length" class="px-5 py-12 text-center text-sm text-zinc-400">No profile questions</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Order</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Question</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Key</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Required</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id" class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
              <td class="px-5 py-3 text-zinc-500">{{ q.sort_order ?? '—' }}</td>
              <td class="px-5 py-3">
                <NuxtLink :to="`/profile-questions/${q.id}/edit`" class="font-medium text-zinc-900 hover:text-rose-600">
                  {{ q.question_text }}
                </NuxtLink>
              </td>
              <td class="px-5 py-3 text-zinc-500 font-mono text-xs">{{ q.question_key }}</td>
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
