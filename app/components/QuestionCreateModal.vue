<script setup lang="ts">
import type { ProfileQuestion } from '~/types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  created: [question: ProfileQuestion]
}>()

const createMutation = useCreateProfileQuestion()

const form = reactive({
  question_key: '',
  question_text: '',
  question_type: 'single_select',
  is_required: false,
  category: 'demographics',
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

const categoryOptions = [
  { label: 'Demographics', value: 'demographics' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Purchasing', value: 'purchasing' },
  { label: 'Interests', value: 'interests' },
  { label: 'Behavior', value: 'behavior' },
  { label: 'Preferences', value: 'preferences' },
]

const showOptions = computed(() => ['single_select', 'multi_select'].includes(form.question_type))

function resetForm() {
  Object.assign(form, {
    question_key: '',
    question_text: '',
    question_type: 'single_select',
    is_required: false,
    category: 'demographics',
  })
  options.value = []
}

function handleSubmit() {
  const body: any = { ...form }
  if (showOptions.value && options.value.length > 0) {
    body.options = options.value.filter(Boolean)
  }
  createMutation.mutate(body, {
    onSuccess: (result: any) => {
      const created = result?.data || result
      emit('created', created)
      resetForm()
    },
  })
}

function handleClose() {
  resetForm()
  createMutation.reset()
  emit('close')
}
</script>

<template>
  <UModal :open="open" @close="handleClose">
    <template #content>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Create Profile Question</h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField label="Question Key" required>
            <UInput v-model="form.question_key" placeholder="e.g. favorite_brand" class="w-full font-mono" size="sm" required />
          </UFormField>

          <UFormField label="Question Text" required>
            <UInput v-model="form.question_text" placeholder="What is your favorite brand?" class="w-full" size="sm" required />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Type">
              <USelect v-model="form.question_type" :items="typeOptions" value-key="value" class="w-full" size="sm" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" size="sm" />
            </UFormField>
          </div>

          <UCheckbox v-model="form.is_required" label="Required" />

          <div v-if="showOptions" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Options</p>
              <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addOption">Add</UButton>
            </div>
            <div v-for="(_, i) in options" :key="i" class="flex items-center gap-2">
              <UInput v-model="options[i]" :placeholder="`Option ${i + 1}`" class="flex-1" size="sm" required />
              <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeOption(i)" />
            </div>
            <p v-if="!options.length" class="text-xs text-zinc-400">No options yet</p>
          </div>

          <div v-if="createMutation.isError.value" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-3 py-2">
            {{ createMutation.error.value?.message || 'Failed to create question' }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" size="sm" @click="handleClose">Cancel</UButton>
            <UButton type="submit" color="primary" size="sm" :loading="createMutation.isPending.value">Create</UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
