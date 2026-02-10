<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const createMutation = useCreateMission()
const uploadMutation = useUploadMissionImage()

const form = reactive({
  title: '',
  description: '',
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

// Upload logo image
async function uploadLogo() {
  if (!logoFile.value) return

  uploadingLogo.value = true
  uploadError.value = ''

  try {
    // Create temporary mission first to get ID (or use a placeholder)
    // For now, we'll upload during form submission
    uploadError.value = 'Logo will be uploaded when mission is created'
  } catch (err: any) {
    uploadError.value = err.message || 'Logo upload failed'
  } finally {
    uploadingLogo.value = false
  }
}

// Upload hero image
async function uploadHero() {
  if (!heroFile.value) return

  uploadingHero.value = true
  uploadError.value = ''

  try {
    uploadError.value = 'Hero image will be uploaded when mission is created'
  } catch (err: any) {
    uploadError.value = err.message || 'Hero upload failed'
  } finally {
    uploadingHero.value = false
  }
}

// Upload gallery images
async function uploadGallery() {
  if (galleryFiles.value.length === 0) return

  uploadingGallery.value = true
  uploadError.value = ''

  try {
    uploadError.value = 'Gallery images will be uploaded when mission is created'
  } catch (err: any) {
    uploadError.value = err.message || 'Gallery upload failed'
  } finally {
    uploadingGallery.value = false
  }
}

function addStage() {
  stages.value.push({
    stage_type: 'visit_link',
    stage_name: '',
    stage_description: '',
    reward_amount: 0,
    is_optional: false,
    config: {},
  })
}

// When stage type changes to survey, initialize question IDs array
function onStageTypeChange(stage: any) {
  if (stage.stage_type === 'survey') {
    if (!stage.config) stage.config = {}
    if (!stage.config.profile_question_ids) stage.config.profile_question_ids = []
  }
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

async function handleSubmit() {
  uploadError.value = ''

  // Step 1: Create the mission first (we need the mission ID for image uploads)
  const body: any = { ...form }
  if (stages.value.length > 0) {
    body.stages = stages.value.map((s: any) => {
      const stage = { ...s }
      // Only include config for survey stages
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

  // Remove image fields from initial creation (we'll update them after upload)
  delete body.brand_logo_url
  delete body.hero_image_url
  delete body.mission_images

  try {
    // Create mission
    const result = await new Promise<any>((resolve, reject) => {
      createMutation.mutate(body, {
        onSuccess: (data) => resolve(data),
        onError: (err) => reject(err),
      })
    })

    const missionId = result.id ?? result.data?.id

    // Step 2: Upload images if any are selected
    const imageUpdates: any = {}

    if (logoFile.value) {
      uploadingLogo.value = true
      try {
        const logoResult = await uploadMutation.mutateAsync({
          file: logoFile.value,
          missionId,
          type: 'logo',
        })
        imageUpdates.brand_logo_url = logoResult.url
      } catch (err: any) {
        uploadError.value = `Logo upload failed: ${err.message}`
      } finally {
        uploadingLogo.value = false
      }
    }

    if (heroFile.value) {
      uploadingHero.value = true
      try {
        const heroResult = await uploadMutation.mutateAsync({
          file: heroFile.value,
          missionId,
          type: 'hero',
        })
        imageUpdates.hero_image_url = heroResult.url
      } catch (err: any) {
        uploadError.value = `Hero upload failed: ${err.message}`
      } finally {
        uploadingHero.value = false
      }
    }

    if (galleryFiles.value.length > 0) {
      uploadingGallery.value = true
      const galleryUrls: string[] = []
      try {
        for (const file of galleryFiles.value) {
          const galleryResult = await uploadMutation.mutateAsync({
            file,
            missionId,
            type: 'gallery',
          })
          galleryUrls.push(galleryResult.url)
        }
        imageUpdates.mission_images = galleryUrls
      } catch (err: any) {
        uploadError.value = `Gallery upload failed: ${err.message}`
      } finally {
        uploadingGallery.value = false
      }
    }

    // Step 3: Update mission with image URLs if any were uploaded
    if (Object.keys(imageUpdates).length > 0) {
      const updateMutation = useUpdateMission()
      await updateMutation.mutateAsync({
        id: missionId,
        data: imageUpdates,
      })
    }

    // Success! Navigate to missions page
    navigateTo('/missions')
  } catch (err: any) {
    uploadError.value = err.message || 'Failed to create mission'
  }
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
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Images</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Upload mission images (optional). Supported formats: JPEG, PNG, WebP.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Brand Logo" help="Max 5MB">
            <div class="space-y-2">
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
              <div v-if="logoFile" class="text-xs text-zinc-500 dark:text-zinc-400">
                Selected: {{ logoFile.name }}
              </div>
            </div>
          </UFormField>

          <UFormField label="Hero Image" help="Max 5MB">
            <div class="space-y-2">
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
              <div v-if="heroFile" class="text-xs text-zinc-500 dark:text-zinc-400">
                Selected: {{ heroFile.name }}
              </div>
            </div>
          </UFormField>
        </div>

        <UFormField label="Gallery Images" help="Max 5MB each, multiple files allowed">
          <div class="space-y-2">
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
            <div v-if="galleryFiles.length > 0" class="text-xs text-zinc-500 dark:text-zinc-400">
              Selected: {{ galleryFiles.length }} file(s)
            </div>
          </div>
        </UFormField>
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
              <USelect v-model="stage.stage_type" :items="stageTypeOptions" value-key="value" class="w-full" size="sm" @update:model-value="onStageTypeChange(stage)" />
            </UFormField>
            <UFormField label="Name">
              <UInput v-model="stage.stage_name" placeholder="Stage name" class="w-full" size="sm" required />
            </UFormField>
          </div>
          <UFormField label="Description">
            <UInput v-model="stage.stage_description" placeholder="Optional description" class="w-full" size="sm" />
          </UFormField>
          <SurveyQuestionPicker
            v-if="stage.stage_type === 'survey'"
            v-model="stage.config.profile_question_ids"
          />
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

      <div v-if="createMutation.isError.value || uploadError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3">
        {{ uploadError || createMutation.error.value?.message || 'Failed to create mission' }}
      </div>

      <div class="flex gap-3">
        <UButton
          type="submit"
          color="primary"
          :loading="createMutation.isPending.value || uploadingLogo || uploadingHero || uploadingGallery"
          size="lg"
        >
          Create Mission
        </UButton>
        <NuxtLink to="/missions">
          <UButton variant="outline" size="lg">Cancel</UButton>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
