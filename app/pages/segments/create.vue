<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()
const saving = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  description: '',
  segment_type: 'dynamic',
  is_active: true,
})

const rules = ref<{ field: string; operator: string; value: string }[]>([])

function addRule() {
  rules.value.push({ field: 'state', operator: 'eq', value: '' })
}
function removeRule(i: number) {
  rules.value.splice(i, 1)
}

const fieldOptions = [
  { label: 'State', value: 'state' },
  { label: 'Country', value: 'country' },
  { label: 'Zipcode', value: 'zipcode' },
  { label: 'Role', value: 'role' },
]

const operatorOptions = [
  { label: 'Equals', value: 'eq' },
  { label: 'Not equals', value: 'neq' },
  { label: 'Contains', value: 'contains' },
  { label: 'In', value: 'in' },
]

const typeOptions = [
  { label: 'Dynamic', value: 'dynamic' },
  { label: 'Static', value: 'static' },
]

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    const body: any = { ...form }
    if (rules.value.length > 0) {
      body.rules = { conditions: rules.value }
    }
    await apiFetch('/segments', { method: 'POST', body })
    navigateTo('/segments')
  } catch (e: any) {
    error.value = e?.data?.error || 'Failed to create segment'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/segments">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Create Segment</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <h2 class="text-base font-semibold">Segment Info</h2>
        <UFormField label="Name" required>
          <UInput v-model="form.name" placeholder="Segment name" class="w-full" required />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="form.description" placeholder="Optional description" :rows="2" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Type">
            <USelect v-model="form.segment_type" :items="typeOptions" value-key="value" class="w-full" />
          </UFormField>
          <div class="flex items-end pb-1">
            <UCheckbox v-model="form.is_active" label="Active" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold">Rules</h2>
          <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addRule">Add Rule</UButton>
        </div>
        <div v-if="!rules.length" class="text-sm text-zinc-400">No rules added yet. Dynamic segments need rules to match users.</div>
        <div v-for="(rule, i) in rules" :key="i" class="border border-zinc-200 rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-zinc-700">Rule {{ i + 1 }}</span>
            <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeRule(i)" />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <UFormField label="Field">
              <USelect v-model="rule.field" :items="fieldOptions" value-key="value" class="w-full" size="sm" />
            </UFormField>
            <UFormField label="Operator">
              <USelect v-model="rule.operator" :items="operatorOptions" value-key="value" class="w-full" size="sm" />
            </UFormField>
            <UFormField label="Value">
              <UInput v-model="rule.value" placeholder="Value" class="w-full" size="sm" required />
            </UFormField>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>

      <div class="flex gap-3">
        <UButton type="submit" color="primary" :loading="saving" size="lg">Create Segment</UButton>
        <NuxtLink to="/segments">
          <UButton variant="outline" size="lg">Cancel</UButton>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
