<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string

const { data: mission, isPending, isError, error } = useMissionQuery(id)
const updateMutation = useUpdateMission()
const statusMutation = useUpdateMissionStatus()
const uploadMutation = useUploadMissionImage()

// Brands dropdown
const { data: brandsData } = useAllBrandsQuery()
const brandOptions = computed(() => {
  const opts = [{ label: '— None —', value: '' }]
  if (brandsData.value) {
    for (const b of brandsData.value) {
      opts.push({ label: b.name, value: b.id })
    }
  }
  return opts
})
const brandModalOpen = ref(false)

function onBrandCreated() {
  brandModalOpen.value = false
}

const form = reactive({
  title: '',
  description: '',
  brand_id: '' as string,
  brand_name: '',
  brand_logo_url: '',
  hero_image_url: '',
  mission_images: [] as string[],
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

// Image upload state
const logoFile = ref<File | null>(null)
const heroFile = ref<File | null>(null)
const galleryFiles = ref<File[]>([])
const uploadingLogo = ref(false)
const uploadingHero = ref(false)
const uploadingGallery = ref(false)
const uploadError = ref('')

// Handle logo file selection
function handleLogoChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    logoFile.value = target.files[0]
    uploadError.value = ''
  }
}

// Handle hero file selection
function handleHeroChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    heroFile.value = target.files[0]
    uploadError.value = ''
  }
}

// Handle gallery files selection
function handleGalleryChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    galleryFiles.value = Array.from(target.files)
    uploadError.value = ''
  }
}

// Upload individual image immediately
async function uploadImageNow(type: 'logo' | 'hero') {
  const file = type === 'logo' ? logoFile.value : heroFile.value
  if (!file) return

  const isLogoUpload = type === 'logo'
  if (isLogoUpload) uploadingLogo.value = true
  else uploadingHero.value = true

  uploadError.value = ''

  try {
    const result = await uploadMutation.mutateAsync({
      file,
      missionId: id,
      type,
    })

    // Update mission immediately with new URL
    await updateMutation.mutateAsync({
      id,
      data: isLogoUpload ? { brand_logo_url: result.url } : { hero_image_url: result.url },
    })

    // Update local form state
    if (isLogoUpload) form.brand_logo_url = result.url
    else form.hero_image_url = result.url

    // Clear file input
    if (isLogoUpload) logoFile.value = null
    else heroFile.value = null
  } catch (err: any) {
    uploadError.value = `Upload failed: ${err.message}`
  } finally {
    if (isLogoUpload) uploadingLogo.value = false
    else uploadingHero.value = false
  }
}

// Upload gallery images immediately
async function uploadGalleryNow() {
  if (galleryFiles.value.length === 0) return

  uploadingGallery.value = true
  uploadError.value = ''

  try {
    const newUrls: string[] = []
    for (const file of galleryFiles.value) {
      const result = await uploadMutation.mutateAsync({
        file,
        missionId: id,
        type: 'gallery',
      })
      newUrls.push(result.url)
    }

    // Append to existing gallery images
    const updatedGallery = [...(form.mission_images || []), ...newUrls]
    await updateMutation.mutateAsync({
      id,
      data: { mission_images: updatedGallery },
    })

    form.mission_images = updatedGallery
    galleryFiles.value = []
  } catch (err: any) {
    uploadError.value = `Gallery upload failed: ${err.message}`
  } finally {
    uploadingGallery.value = false
  }
}

watch(mission, (res) => {
  if (res && !formReady.value) {
    Object.assign(form, {
      title: res.title || '',
      description: res.description || '',
      brand_id: res.brand_id || '',
      brand_name: res.brand_name || '',
      brand_logo_url: res.brand_logo_url || '',
      hero_image_url: res.hero_image_url || '',
      mission_images: res.mission_images || [],
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
      config: s.config || {},
    }))
    formReady.value = true
  }
}, { immediate: true })

function addStage() {
  stages.value.push({ stage_type: 'visit_link', stage_name: '', stage_description: '', reward_amount: 0, is_optional: false, config: {} })
}
function removeStage(i: number) { stages.value.splice(i, 1) }

function onStageTypeChange(stage: any) {
  if (stage.stage_type === 'survey') {
    if (!stage.config) stage.config = {}
    if (!stage.config.profile_question_ids) stage.config.profile_question_ids = []
  }
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

const statusColor: Record<string, string> = {
  draft: 'neutral',
  active: 'success',
  paused: 'warning',
  completed: 'info',
  archived: 'neutral',
}

function handleSubmit() {
  const body: any = { ...form }
  // Send brand_id (backend auto-populates brand fields); send null to clear
  if (body.brand_id) {
    delete body.brand_name
  } else {
    body.brand_id = null
    delete body.brand_name
  }
  if (stages.value.length > 0) {
    body.stages = stages.value.map((s: any) => {
      const stage = { ...s }
      if (stage.stage_type === 'survey' && stage.config?.profile_question_ids?.length) {
        stage.config = { profile_question_ids: stage.config.profile_question_ids }
      } else {
        delete stage.config
      }
      return stage
    })
  }
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
            <UFormField label="Brand">
              <div class="flex gap-2">
                <USelect v-model="form.brand_id" :items="brandOptions" value-key="value" class="flex-1" />
                <UButton variant="outline" size="sm" icon="i-lucide-plus" @click="brandModalOpen = true" title="Create Brand" />
              </div>
            </UFormField>
            <UFormField label="Reward ($)">
              <UInput v-model.number="form.reward_amount" type="number" step="0.01" min="0" class="w-full" />
            </UFormField>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Images</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Upload mission images. Changes are saved immediately. Supported formats: JPEG, PNG, WebP.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Logo Upload -->
            <div class="space-y-3">
              <UFormField label="Brand Logo" help="Max 5MB">
                <div class="space-y-2">
                  <div v-if="form.brand_logo_url" class="relative w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                    <img :src="form.brand_logo_url" alt="Logo" class="w-full h-full object-contain" />
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    @change="handleLogoChange"
                    class="block w-full text-sm text-zinc-500 dark:text-zinc-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-zinc-100 dark:file:bg-zinc-800
                      file:text-zinc-700 dark:file:text-zinc-300
                      hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700
                      file:cursor-pointer cursor-pointer"
                  />
                  <div v-if="logoFile" class="flex items-center gap-2">
                    <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ logoFile.name }}</span>
                    <UButton
                      size="xs"
                      color="primary"
                      :loading="uploadingLogo"
                      @click="uploadImageNow('logo')"
                    >
                      Upload
                    </UButton>
                  </div>
                </div>
              </UFormField>
            </div>

            <!-- Hero Image Upload -->
            <div class="space-y-3">
              <UFormField label="Hero Image" help="Max 5MB">
                <div class="space-y-2">
                  <div v-if="form.hero_image_url" class="relative w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                    <img :src="form.hero_image_url" alt="Hero" class="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    @change="handleHeroChange"
                    class="block w-full text-sm text-zinc-500 dark:text-zinc-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-zinc-100 dark:file:bg-zinc-800
                      file:text-zinc-700 dark:file:text-zinc-300
                      hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700
                      file:cursor-pointer cursor-pointer"
                  />
                  <div v-if="heroFile" class="flex items-center gap-2">
                    <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ heroFile.name }}</span>
                    <UButton
                      size="xs"
                      color="primary"
                      :loading="uploadingHero"
                      @click="uploadImageNow('hero')"
                    >
                      Upload
                    </UButton>
                  </div>
                </div>
              </UFormField>
            </div>
          </div>

          <!-- Gallery Images -->
          <UFormField label="Gallery Images" help="Max 5MB each, multiple files allowed">
            <div class="space-y-3">
              <div v-if="form.mission_images && form.mission_images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-for="(url, idx) in form.mission_images" :key="idx" class="relative w-full aspect-square rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                  <img :src="url" alt="Gallery" class="w-full h-full object-cover" />
                </div>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                @change="handleGalleryChange"
                class="block w-full text-sm text-zinc-500 dark:text-zinc-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-zinc-100 dark:file:bg-zinc-800
                  file:text-zinc-700 dark:file:text-zinc-300
                  hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700
                  file:cursor-pointer cursor-pointer"
              />
              <div v-if="galleryFiles.length > 0" class="flex items-center gap-2">
                <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ galleryFiles.length }} file(s) selected</span>
                <UButton
                  size="xs"
                  color="primary"
                  :loading="uploadingGallery"
                  @click="uploadGalleryNow"
                >
                  Upload
                </UButton>
              </div>
            </div>
          </UFormField>

          <div v-if="uploadError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
            {{ uploadError }}
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
                <USelect v-model="stage.stage_type" :items="stageTypeOptions" value-key="value" class="w-full" size="sm" @update:model-value="onStageTypeChange(stage)" />
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
            <SurveyQuestionPicker v-if="stage.stage_type === 'survey'" v-model="stage.config.profile_question_ids" />
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

    <BrandFormModal :open="brandModalOpen" @close="brandModalOpen = false" @saved="onBrandCreated" />
  </div>
</template>
