<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const saving = ref(false)
const error = ref('')

const form = reactive({
  question_key: '',
  question_text: '',
  question_type: 'text',
  is_required: false,
  sort_order: 0,
})

const options = ref<string[]>([])

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

const showOptions = computed(() => ['single_select', 'multi_select'].includes(form.question_type))

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    const body: any = { ...form }
    if (showOptions.value && options.value.length > 0) {
      body.options = options.value.filter(Boolean)
    }
    await apiFetch('/profile-questions', { method: 'POST', body })
    navigateTo('/profile-questions')
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to create question'
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
      <h1 class="text-2xl font-bold">Create Profile Question</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <UFormField label="Question Key" required>
          <UInput v-model="form.question_key" placeholder="e.g. favorite_brand" class="w-full font-mono" required />
          <template #help>Unique identifier for this question (snake_case)</template>
        </UFormField>
        <UFormField label="Question Text" required>
          <UInput v-model="form.question_text" placeholder="What is your favorite brand?" class="w-full" required />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Type" required>
            <USelect v-model="form.question_type" :items="typeOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Sort Order">
            <UInput v-model.number="form.sort_order" type="number" min="0" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
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
        <div v-if="!options.length" class="text-sm text-zinc-400">No options added yet</div>
        <div v-for="(_, i) in options" :key="i" class="flex items-center gap-2">
          <UInput v-model="options[i]" :placeholder="`Option ${i + 1}`" class="flex-1" size="sm" required />
          <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeOption(i)" />
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>

      <div class="flex gap-3">
        <UButton type="submit" color="primary" :loading="saving" size="lg">Create Question</UButton>
        <NuxtLink to="/profile-questions">
          <UButton variant="outline" size="lg">Cancel</UButton>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
