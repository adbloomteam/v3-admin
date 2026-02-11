<script setup lang="ts">
import type { ProfileQuestion } from '~/types'

const model = defineModel<string[]>({ default: () => [] })

// Ensure model is always an array (guards against undefined from parent)
const selectedIds = computed(() => model.value || [])

const { data, isPending } = useProfileQuestionsQuery()
const questions = computed<ProfileQuestion[]>(() => (data.value?.data || []).filter((q: ProfileQuestion) => q.is_active !== false))

const search = ref('')
const categoryFilter = ref('all')

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Demographics', value: 'demographics' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Purchasing', value: 'purchasing' },
  { label: 'Interests', value: 'interests' },
  { label: 'Behavior', value: 'behavior' },
  { label: 'Preferences', value: 'preferences' },
]

const categoryLabel: Record<string, string> = {
  demographics: 'Demographics',
  lifestyle: 'Lifestyle',
  purchasing: 'Purchasing',
  interests: 'Interests',
  behavior: 'Behavior',
  preferences: 'Preferences',
}

const questionTypeLabel: Record<string, string> = {
  text: 'Text',
  single_select: 'Select',
  multi_select: 'Multi',
  number: 'Number',
  date: 'Date',
}

const filtered = computed(() => {
  let list = questions.value
  if (categoryFilter.value !== 'all') {
    list = list.filter(q => q.category === categoryFilter.value)
  }
  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    list = list.filter(q =>
      q.question_text.toLowerCase().includes(s) ||
      q.question_key.toLowerCase().includes(s)
    )
  }
  return list
})

// Group by category for display
const grouped = computed(() => {
  const groups: Record<string, ProfileQuestion[]> = {}
  for (const q of filtered.value) {
    const cat = q.category || 'demographics'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(q)
  }
  return groups
})

function toggle(id: string) {
  const current = [...selectedIds.value]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  model.value = current
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

// Inline create modal
const showCreateModal = ref(false)

function onQuestionCreated(newQuestion: ProfileQuestion) {
  // Auto-select the newly created question
  if (newQuestion?.id) {
    model.value = [...selectedIds.value, newQuestion.id]
  }
  showCreateModal.value = false
}
</script>

<template>
  <div class="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Survey Questions</h3>
        <UBadge v-if="selectedIds.length" variant="subtle" color="primary" size="xs">{{ selectedIds.length }} selected</UBadge>
      </div>
      <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="showCreateModal = true">New Question</UButton>
    </div>

    <div class="flex items-center gap-2">
      <UInput v-model="search" placeholder="Search questions..." size="sm" class="flex-1" icon="i-lucide-search" />
      <USelect v-model="categoryFilter" :items="categoryOptions" value-key="value" size="sm" class="w-40" />
    </div>

    <div v-if="isPending" class="flex items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-zinc-400" />
    </div>

    <div v-else-if="!filtered.length" class="text-sm text-zinc-400 text-center py-6">
      No questions found
    </div>

    <div v-else class="max-h-64 overflow-y-auto space-y-4">
      <div v-for="(items, cat) in grouped" :key="cat">
        <p class="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{{ categoryLabel[cat] || cat }}</p>
        <div class="space-y-1">
          <button
            v-for="q in items"
            :key="q.id"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
            :class="isSelected(q.id) ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent'"
            @click="toggle(q.id)"
          >
            <div
              class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
              :class="isSelected(q.id) ? 'bg-rose-500 border-rose-500' : 'border-zinc-300 dark:border-zinc-600'"
            >
              <UIcon v-if="isSelected(q.id)" name="i-lucide-check" class="w-3 h-3 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ q.question_text }}</p>
              <p class="text-[10px] text-zinc-400 font-mono">{{ q.question_key }}</p>
            </div>
            <UBadge color="neutral" variant="subtle" size="xs">{{ questionTypeLabel[q.question_type] || q.question_type }}</UBadge>
          </button>
        </div>
      </div>
    </div>

    <QuestionCreateModal
      :open="showCreateModal"
      @close="showCreateModal = false"
      @created="onQuestionCreated"
    />
  </div>
</template>
