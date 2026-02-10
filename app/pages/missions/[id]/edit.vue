<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string

const { data: mission, isPending, isError, error } = useMissionQuery(id)
const updateMutation = useUpdateMission()
const statusMutation = useUpdateMissionStatus()

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
const formReady = ref(false)

watch(mission, (res) => {
  if (res && !formReady.value) {
    Object.assign(form, {
      title: res.title || '',
      description: res.description || '',
      brand_name: res.brand_name || '',
      mission_type: res.mission_type || 'affiliate',
      category: res.category || 'none',
      affiliate_url: res.affiliate_url || '',
      affiliate_network: res.affiliate_network || '',
      reward_amount: (res.reward_amount || 0) / 100,
      max_participants: res.max_participants || null,
      is_featured: !!res.is_featured,
      is_public: res.is_public !== false,
      terms_conditions: res.terms_conditions || '',
      estimated_completion_minutes: res.estimated_completion_minutes || null,
      start_date: res.start_date ? res.start_date.slice(0, 16) : '',
      end_date: res.end_date ? res.end_date.slice(0, 16) : '',
    })
    stages.value = (res.stages || []).map((s: any) => ({
      stage_type: s.stage_type,
      stage_name: s.stage_name,
      stage_description: s.stage_description || '',
      reward_amount: (s.reward_amount || 0) / 100,
      is_optional: !!s.is_optional,
    }))
    formReady.value = true
  }
}, { immediate: true })

function addStage() {
  stages.value.push({ stage_type: 'visit_link', stage_name: '', stage_description: '', reward_amount: 0, is_optional: false })
}
function removeStage(i: number) { stages.value.splice(i, 1) }

const typeOptions = [
  { label: 'Affiliate', value: 'affiliate' },
  { label: 'Survey', value: 'survey' },
  { label: 'CPG', value: 'cpg' },
  { label: 'Digital Review', value: 'digital_review' },
  { label: 'UGC', value: 'ugc' },
  { label: 'Focus Group', value: 'focus_group' },
]

const categoryOptions = [
  { label: 'None', value: 'none' },
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
  if (!body.category || body.category === 'none') delete body.category
  updateMutation.mutate({ id, data: body }, {
    onSuccess: () => navigateTo('/missions'),
  })
}

function updateStatus(status: string) {
  statusMutation.mutate({ id, status: status as any })
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/missions">
        <UButton variant="ghost" size="xs" icon="i-lucide-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Edit Mission</h1>
      <template v-if="mission">
        <UBadge :color="(statusColor[mission.status] as any) || 'neutral'" variant="subtle" class="ml-2">
          {{ mission.status }}
        </UBadge>
      </template>
    </div>

    <div v-if="isPending" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
    </div>

    <template v-else-if="mission">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ mission.participant_count ?? 0 }}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Participants</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ mission.click_count ?? 0 }}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Clicks</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ mission.conversion_count ?? 0 }}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Conversions</p>
        </div>
      </div>

      <div class="flex gap-2 mb-6">
        <UButton v-if="mission.status === 'draft'" size="sm" color="success" @click="updateStatus('active')">Activate</UButton>
        <UButton v-if="mission.status === 'active'" size="sm" color="warning" @click="updateStatus('paused')">Pause</UButton>
        <UButton v-if="mission.status === 'paused'" size="sm" color="success" @click="updateStatus('active')">Resume</UButton>
        <UButton v-if="['active','paused'].includes(mission.status)" size="sm" color="neutral" @click="updateStatus('completed')">Complete</UButton>
        <UButton v-if="mission.status === 'completed'" size="sm" color="neutral" variant="outline" @click="updateStatus('archived')">Archive</UButton>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Basic Info</h2>
          <UFormField label="Title" required>
            <UInput v-model="form.title" class="w-full" required />
          </UFormField>
          <UFormField label="Description" required>
            <UTextarea v-model="form.description" :rows="3" class="w-full" required />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Type">
              <USelect v-model="form.mission_type" :items="typeOptions" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="categoryOptions" value-key="value" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Brand Name">
              <UInput v-model="form.brand_name" class="w-full" />
            </UFormField>
            <UFormField label="Reward ($)">
              <UInput v-model.number="form.reward_amount" type="number" step="0.01" min="0" class="w-full" />
            </UFormField>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Affiliate & Limits</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Affiliate URL">
              <UInput v-model="form.affiliate_url" type="url" class="w-full" />
            </UFormField>
            <UFormField label="Network">
              <UInput v-model="form.affiliate_network" class="w-full" />
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
          <UTextarea v-model="form.terms_conditions" :rows="3" class="w-full" />
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Stages</h2>
            <UButton variant="outline" size="xs" icon="i-lucide-plus" @click="addStage">Add Stage</UButton>
          </div>
          <div v-if="!stages.length" class="text-sm text-zinc-400">No stages</div>
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
                <UInput v-model="stage.stage_name" class="w-full" size="sm" required />
              </UFormField>
            </div>
            <UFormField label="Description">
              <UInput v-model="stage.stage_description" class="w-full" size="sm" />
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

        <div v-if="updateMutation.isError.value" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
          {{ updateMutation.error.value?.message || 'Failed to update mission' }}
        </div>

        <div class="flex gap-3">
          <UButton type="submit" color="primary" :loading="updateMutation.isPending.value" size="lg">Save Changes</UButton>
          <NuxtLink to="/missions">
            <UButton variant="outline" size="lg">Cancel</UButton>
          </NuxtLink>
        </div>
      </form>
    </template>

    <div v-else-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
      {{ error?.message || 'Mission not found' }}
    </div>
  </div>
</template>
