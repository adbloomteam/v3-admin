<script setup lang="ts">
import type { Brand } from '~/types'

const props = defineProps<{
  open: boolean
  brand?: Brand | null
}>()

const emit = defineEmits<{
  close: []
  saved: [brand: Brand]
}>()

const isEdit = computed(() => !!props.brand)

const createMutation = useCreateBrand()
const updateMutation = useUpdateBrand()
const uploadMutation = useUploadBrandImage()

const form = reactive({
  name: '',
  description: '',
  website_url: '',
  external_affiliate_id: '',
})

const logoFile = ref<File | null>(null)
const imageFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)
const imagePreview = ref<string | null>(null)
const saving = ref(false)

watch(() => props.open, (val) => {
  if (val && props.brand) {
    form.name = props.brand.name
    form.description = props.brand.description || ''
    form.website_url = props.brand.website_url || ''
    form.external_affiliate_id = props.brand.external_affiliate_id || ''
    logoPreview.value = props.brand.logo_url || null
    imagePreview.value = props.brand.image_url || null
  } else if (val) {
    resetForm()
  }
})

function resetForm() {
  Object.assign(form, {
    name: '',
    description: '',
    website_url: '',
    external_affiliate_id: '',
  })
  logoFile.value = null
  imageFile.value = null
  logoPreview.value = null
  imagePreview.value = null
}

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function removeLogo() {
  logoFile.value = null
  logoPreview.value = null
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
}

const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  saving.value = true

  try {
    let brand: Brand

    const body: any = {
      name: form.name,
    }
    if (form.description) body.description = form.description
    if (form.website_url) body.website_url = form.website_url
    if (form.external_affiliate_id) body.external_affiliate_id = form.external_affiliate_id

    if (isEdit.value && props.brand) {
      // Update brand
      if (!logoPreview.value && props.brand.logo_url) body.logo_url = null
      if (!imagePreview.value && props.brand.image_url) body.image_url = null

      const result = await updateMutation.mutateAsync({ id: props.brand.id, data: body })
      brand = result.data
    } else {
      // Create brand
      const result = await createMutation.mutateAsync(body)
      brand = result.data
    }

    // Upload images if new files were selected
    if (logoFile.value) {
      const uploadResult = await uploadMutation.mutateAsync({
        file: logoFile.value,
        brandId: brand.id,
        type: 'logo',
      })
      await updateMutation.mutateAsync({
        id: brand.id,
        data: { logo_url: uploadResult.url },
      })
      brand.logo_url = uploadResult.url
    }

    if (imageFile.value) {
      const uploadResult = await uploadMutation.mutateAsync({
        file: imageFile.value,
        brandId: brand.id,
        type: 'image',
      })
      await updateMutation.mutateAsync({
        id: brand.id,
        data: { image_url: uploadResult.url },
      })
      brand.image_url = uploadResult.url
    }

    emit('saved', brand)
    resetForm()
  } catch (err: any) {
    errorMsg.value = err?.message || 'Failed to save brand'
  } finally {
    saving.value = false
  }
}

function handleClose() {
  resetForm()
  errorMsg.value = ''
  createMutation.reset()
  updateMutation.reset()
  emit('close')
}

const descriptionLength = computed(() => {
  return form.description.split(/\s+/).filter(Boolean).length
})
</script>

<template>
  <UModal :open="open" @close="handleClose">
    <template #content>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-(--ui-text) mb-4">
          {{ isEdit ? 'Edit Brand' : 'Create Brand' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField label="Brand Name" required>
            <UInput v-model="form.name" placeholder="e.g. Acme Corp" class="w-full" size="sm" required />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="form.description"
              placeholder="Brief brand description..."
              class="w-full"
              :rows="3"
              size="sm"
            />
            <p class="text-xs mt-1" :class="descriptionLength > 100 ? 'text-red-500' : 'text-(--ui-text-muted)'">
              {{ descriptionLength }}/100 words
            </p>
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Website URL">
              <UInput v-model="form.website_url" placeholder="https://..." class="w-full" size="sm" type="url" />
            </UFormField>
            <UFormField label="External Affiliate ID">
              <UInput v-model="form.external_affiliate_id" placeholder="e.g. HO-12345" class="w-full" size="sm" />
            </UFormField>
          </div>

          <!-- Logo upload -->
          <UFormField label="Logo">
            <div class="flex items-center gap-3">
              <div v-if="logoPreview" class="relative">
                <img :src="logoPreview" alt="Logo preview" class="w-16 h-16 rounded-lg object-cover border border-(--ui-border)" />
                <button type="button" @click="removeLogo" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </div>
              <label class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-(--ui-border) text-sm text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) transition-colors">
                <UIcon name="i-lucide-upload" class="size-4" />
                {{ logoPreview ? 'Replace' : 'Upload Logo' }}
                <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onLogoChange" />
              </label>
            </div>
          </UFormField>

          <!-- Brand image upload -->
          <UFormField label="Brand Image">
            <div class="flex items-center gap-3">
              <div v-if="imagePreview" class="relative">
                <img :src="imagePreview" alt="Image preview" class="w-16 h-16 rounded-lg object-cover border border-(--ui-border)" />
                <button type="button" @click="removeImage" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </div>
              <label class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-(--ui-border) text-sm text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) transition-colors">
                <UIcon name="i-lucide-upload" class="size-4" />
                {{ imagePreview ? 'Replace' : 'Upload Image' }}
                <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onImageChange" />
              </label>
            </div>
          </UFormField>

          <div v-if="errorMsg" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-3 py-2">
            {{ errorMsg }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" size="sm" @click="handleClose">Cancel</UButton>
            <UButton
              type="submit"
              color="primary"
              size="sm"
              :loading="saving"
              :disabled="!form.name || descriptionLength > 100"
            >
              {{ isEdit ? 'Save Changes' : 'Create Brand' }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
