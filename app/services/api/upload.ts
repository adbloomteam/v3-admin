export interface UploadResult {
  url: string
  path: string
}

export interface UploadMissionImageParams {
  file: File
  missionId: string
  type: 'logo' | 'hero' | 'gallery'
}

export interface UploadAvatarParams {
  file: File
  userId: string
}

export interface UploadBrandImageParams {
  file: File
  brandId: string
  type: 'logo' | 'image'
}

export function useUploadService() {
  const { apiFetch } = useApi()

  /**
   * Upload mission image (logo, hero, or gallery)
   * Validates file type and size client-side before sending
   */
  async function uploadMissionImage(params: UploadMissionImageParams): Promise<UploadResult> {
    const { file, missionId, type } = params

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Max 5MB')
    }

    // Build FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('missionId', missionId)
    formData.append('type', type)

    // Send to backend (note: no Content-Type header — browser sets it automatically with boundary)
    return apiFetch<UploadResult>('/upload/mission-image', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Upload user avatar
   * Validates file type and size client-side before sending
   */
  async function uploadAvatar(params: UploadAvatarParams): Promise<UploadResult> {
    const { file, userId } = params

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP')
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File too large. Max 2MB for avatars')
    }

    // Build FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    // Send to backend
    return apiFetch<UploadResult>('/upload/avatar', {
      method: 'POST',
      body: formData,
    })
  }

  async function uploadBrandImage(params: UploadBrandImageParams): Promise<UploadResult> {
    const { file, brandId, type } = params

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Max 5MB')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('brandId', brandId)
    formData.append('type', type)

    return apiFetch<UploadResult>('/upload/brand-image', {
      method: 'POST',
      body: formData,
    })
  }

  return { uploadMissionImage, uploadAvatar, uploadBrandImage }
}
