<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string

const { data: question, isPending, isError, error } = useProfileQuestionQuery(id)
const updateMutation = useUpdateProfileQuestion()

const form = reactive({
  question_key: '',
  question_text: '',
  question_type: 'text',
  is_required: false,
  category: 'demographics',
})

const options = ref<string[]>([])
const formReady = ref(false)

watch(question, (res) => {
  if (res && !formReady.value) {
    const q = (res as any).data || res
    Object.assign(form, {
      question_key: q.question_key || '',
      question_text: q.question_text || '',
      question_type: q.question_type || 'text',
      is_required: !!q.is_required,
      category: q.category || 'demographics',
    })
    if (Array.isArray(q.options)) {
      options.value = [...q.options]
    }
    formReady.value = true
  }
}, { immediate: true })

function addOption() {
  options.value.push('')
}
function removeOption(i: number) {
  options.value.splice(i, 1)
}

const typeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Select', value: 'single_select' },
  { label: 'Multi Select', value: 'multi_select' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
]

const categoryOptions = [
  { label: 'Demographics', value: 'demographics' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Purchasing', value: 'purchasing' },
  { label: 'Interests', value: 'interests' },
  { label: 'Behavior', value: 'behavior' },
  { label: 'Preferences', value: 'preferences' },
]

const showOptions = computed(() => ['single_select', 'multi_select'].includes(form.question_type))

function handleSubmit() {
  const body: any = { ...form }
  if (showOptions.value && options.value.length > 0) {
    body.options = options.value.filter(Boolean)
  }
  updateMutation.mutate({ id, data: body }, {
    onSuccess: () => navigateTo('/profile-questions'),
  })
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/profile-questions">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Edit Profile Question</h1>
    </div>

    <div v-if="isPending" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <div v-else-if="isError && !formReady" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
      {{ error?.message || 'Failed to load question' }}
    </div>

    <template v-else-if="formReady">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <UFormField label="Question Key" required>
            <UInput v-model="form.question_key" class="w-full font-mono" required />
            <template #help>Unique identifier (snake_case)</template>
          </UFormField>
          <UFormField label="Question Text" required>
            <UInput v-model="form.question_text" class="w-full" required />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Type" required>
              <USelect v-model="form.question_type" :items="typeOptions" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" />
            </UFormField>
          </div>
          <div class="flex items-center pb-1">
            <UCheckbox v-model="form.is_required" label="Required" />
          </div>
        </div>

        <div v-if="showOptions" class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Options</h2>
            <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addOption">Add Option</UButton>
          </div>
          <div v-if="!options.length" class="text-sm text-zinc-400">No options</div>
          <div v-for="(_, i) in options" :key="i" class="flex items-center gap-2">
            <UInput v-model="options[i]" :placeholder="`Option ${i + 1}`" class="flex-1" size="sm" required />
            <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeOption(i)" />
          </div>
        </div>

        <div v-if="updateMutation.isError.value" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
          {{ updateMutation.error.value?.message || 'Failed to update question' }}
        </div>

        <div class="flex gap-3">
          <UButton type="submit" color="primary" :loading="updateMutation.isPending.value" size="lg">Save Changes</UButton>
          <NuxtLink to="/profile-questions">
            <UButton variant="outline" size="lg">Cancel</UButton>
          </NuxtLink>
        </div>
      </form>
    </template>
  </div>
</template>
