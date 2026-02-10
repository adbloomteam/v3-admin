<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string
const { apiFetch } = useApi()
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const form = reactive({
  question_key: '',
  question_text: '',
  question_type: 'text',
  is_required: false,
  display_order: 0,
  category: '',
})

const options = ref<string[]>([])

onMounted(async () => {
  try {
    const res = await apiFetch<any>(`/profile-questions/${id}`)
    const q = res.data || res
    Object.assign(form, {
      question_key: q.question_key || '',
      question_text: q.question_text || '',
      question_type: q.question_type || 'text',
      is_required: !!q.is_required,
      display_order: q.display_order ?? 0,
      category: q.category || '',
    })
    if (Array.isArray(q.options)) {
      options.value = [...q.options]
    }
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to load question'
  } finally {
    loading.value = false
  }
})

function addOption() {
  options.value.push('')
}
function removeOption(i: number) {
  options.value.splice(i, 1)
}

const typeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Select', value: 'select' },
  { label: 'Multi Select', value: 'multi_select' },
  { label: 'Yes/No', value: 'boolean' },
  { label: 'Number', value: 'number' },
]

const categoryOptions = [
  { label: 'None', value: '' },
  { label: 'Demographics', value: 'demographics' },
  { label: 'Preferences', value: 'preferences' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Lifestyle', value: 'lifestyle' },
]

const showOptions = computed(() => ['select', 'multi_select'].includes(form.question_type))

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    const body: any = { ...form }
    if (showOptions.value && options.value.length > 0) {
      body.options = options.value.filter(Boolean)
    }
    if (!body.category) delete body.category
    await apiFetch(`/profile-questions/${id}`, { method: 'PUT', body })
    navigateTo('/profile-questions')
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to update question'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/profile-questions">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Edit Profile Question</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <template v-else-if="!error || form.question_key">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <UFormField label="Question Key" required>
            <UInput v-model="form.question_key" class="w-full font-mono" required />
            <template #help>Unique identifier (snake_case)</template>
          </UFormField>
          <UFormField label="Question Text" required>
            <UInput v-model="form.question_text" class="w-full" required />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Type" required>
              <USelect v-model="form.question_type" :items="typeOptions" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Display Order">
              <UInput v-model.number="form.display_order" type="number" min="0" class="w-full" />
            </UFormField>
            <div class="flex items-end pb-1">
              <UCheckbox v-model="form.is_required" label="Required" />
            </div>
          </div>
        </div>

        <div v-if="showOptions" class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold">Options</h2>
            <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addOption">Add Option</UButton>
          </div>
          <div v-if="!options.length" class="text-sm text-zinc-400">No options</div>
          <div v-for="(_, i) in options" :key="i" class="flex items-center gap-2">
            <UInput v-model="options[i]" :placeholder="`Option ${i + 1}`" class="flex-1" size="sm" required />
            <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeOption(i)" />
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>

        <div class="flex gap-3">
          <UButton type="submit" color="primary" :loading="saving" size="lg">Save Changes</UButton>
          <NuxtLink to="/profile-questions">
            <UButton variant="outline" size="lg">Cancel</UButton>
          </NuxtLink>
        </div>
      </form>
    </template>

    <div v-else class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>
  </div>
</template>
