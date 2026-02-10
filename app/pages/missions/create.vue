<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const createMutation = useCreateMission()

const form = reactive({
  title: '',
  description: '',
  brand_name: '',
  mission_type: 'affiliate',
  category: '',
  affiliate_url: '',
  affiliate_network: '',
  reward_amount: 0,
  max_participants: null as number | null,
  is_featured: false,
  is_public: true,
  terms_conditions: '',
  estimated_completion_minutes: null as number | null,
  start_date: '',
  end_date: '',
})

const stages = ref<any[]>([])

function addStage() {
  stages.value.push({
    stage_type: 'visit_link',
    stage_name: '',
    stage_description: '',
    reward_amount: 0,
    is_optional: false,
  })
}

function removeStage(i: number) {
  stages.value.splice(i, 1)
}

const typeOptions = [
  { label: 'Affiliate', value: 'affiliate' },
  { label: 'Survey', value: 'survey' },
  { label: 'CPG', value: 'cpg' },
  { label: 'Digital Review', value: 'digital_review' },
  { label: 'UGC', value: 'ugc' },
  { label: 'Focus Group', value: 'focus_group' },
]

const categoryOptions = [
  { label: 'None', value: '' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Food', value: 'food' },
  { label: 'Health', value: 'health' },
  { label: 'Tech', value: 'tech' },
  { label: 'Home', value: 'home' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Finance', value: 'finance' },
]

const stageTypeOptions = [
  { label: 'Visit Link', value: 'visit_link' },
  { label: 'Survey', value: 'survey' },
  { label: 'Image Upload', value: 'image_upload' },
  { label: 'Video Upload', value: 'video_upload' },
  { label: 'Receipt Upload', value: 'receipt_upload' },
]

function handleSubmit() {
  const body: any = { ...form }
  if (stages.value.length > 0) body.stages = stages.value
  if (!body.max_participants) delete body.max_participants
  if (!body.estimated_completion_minutes) delete body.estimated_completion_minutes
  if (!body.start_date) delete body.start_date
  if (!body.end_date) delete body.end_date
  if (!body.category) delete body.category
  createMutation.mutate(body, {
    onSuccess: () => navigateTo('/missions'),
  })
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/missions">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Mission</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Basic Info</h2>
        <UFormField label="Title" required>
          <UInput v-model="form.title" placeholder="Mission title" class="w-full" required />
        </UFormField>
        <UFormField label="Description" required>
          <UTextarea v-model="form.description" placeholder="Describe the mission..." :rows="3" class="w-full" required />
        </UFormField>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Type" required>
            <USelect v-model="form.mission_type" :items="typeOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Category">
            <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Brand Name">
            <UInput v-model="form.brand_name" placeholder="Brand" class="w-full" />
          </UFormField>
          <UFormField label="Reward Amount ($)" required>
            <UInput v-model.number="form.reward_amount" type="number" step="0.01" min="0" class="w-full" required />
          </UFormField>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Affiliate & Limits</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Affiliate URL">
            <UInput v-model="form.affiliate_url" type="url" placeholder="https://..." class="w-full" />
          </UFormField>
          <UFormField label="Affiliate Network">
            <UInput v-model="form.affiliate_network" placeholder="e.g. hasoffers" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Max Participants">
            <UInput v-model.number="form.max_participants" type="number" min="1" class="w-full" />
          </UFormField>
          <UFormField label="Est. Minutes">
            <UInput v-model.number="form.estimated_completion_minutes" type="number" min="1" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Start Date">
            <UInput v-model="form.start_date" type="datetime-local" class="w-full" />
          </UFormField>
          <UFormField label="End Date">
            <UInput v-model="form.end_date" type="datetime-local" class="w-full" />
          </UFormField>
        </div>
        <div class="flex gap-6">
          <UCheckbox v-model="form.is_featured" label="Featured" />
          <UCheckbox v-model="form.is_public" label="Public" />
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Terms & Conditions</h2>
        <UTextarea v-model="form.terms_conditions" placeholder="Enter terms..." :rows="3" class="w-full" />
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Stages</h2>
          <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addStage">Add Stage</UButton>
        </div>
        <div v-if="!stages.length" class="text-sm text-zinc-400">No stages added yet</div>
        <div v-for="(stage, i) in stages" :key="i" class="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Stage {{ i + 1 }}</span>
            <UButton variant="ghost" size="xs" color="error" icon="i-lucide-x" @click="removeStage(i)" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="Type">
              <USelect v-model="stage.stage_type" :items="stageTypeOptions" value-key="value" class="w-full" size="sm" />
            </UFormField>
            <UFormField label="Name">
              <UInput v-model="stage.stage_name" placeholder="Stage name" class="w-full" size="sm" required />
            </UFormField>
          </div>
          <UFormField label="Description">
            <UInput v-model="stage.stage_description" placeholder="Optional description" class="w-full" size="sm" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="Reward ($)">
              <UInput v-model.number="stage.reward_amount" type="number" step="0.01" min="0" class="w-full" size="sm" />
            </UFormField>
            <div class="flex items-end pb-1">
              <UCheckbox v-model="stage.is_optional" label="Optional" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="createMutation.isError.value" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
        {{ createMutation.error.value?.message || 'Failed to create mission' }}
      </div>

      <div class="flex gap-3">
        <UButton type="submit" color="primary" :loading="createMutation.isPending.value" size="lg">Create Mission</UButton>
        <NuxtLink to="/missions">
          <UButton variant="outline" size="lg">Cancel</UButton>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
