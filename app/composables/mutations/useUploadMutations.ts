import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UploadMissionImageParams, UploadAvatarParams, UploadBrandImageParams } from '~/services/api/upload'

/**
 * Upload mission image mutation
 * Invalidates mission query on success
 */
export function useUploadMissionImage() {
  const { uploadMissionImage } = useUploadService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UploadMissionImageParams) => uploadMissionImage(params),
    onSuccess: (_data, vars) => {
      // Invalidate the specific mission to refresh its images
      queryClient.invalidateQueries({ queryKey: ['mission', vars.missionId] })
    },
  })
}

/**
 * Delete mission image mutation
 * Cleans up storage and invalidates mission query
 */
export function useDeleteMissionImage() {
  const { deleteMissionImage } = useUploadService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ url, missionId }: { url: string; missionId: string }) => deleteMissionImage(url),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['mission', vars.missionId] })
    },
  })
}

/**
 * Upload avatar mutation
 * Invalidates user query on success
 */
export function useUploadAvatar() {
  const { uploadAvatar } = useUploadService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UploadAvatarParams) => uploadAvatar(params),
    onSuccess: (_data, vars) => {
      // Invalidate the specific user to refresh their avatar
      queryClient.invalidateQueries({ queryKey: ['user', vars.userId] })
      // Also invalidate users list in case avatar shows up there
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUploadBrandImage() {
  const { uploadBrandImage } = useUploadService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UploadBrandImageParams) => uploadBrandImage(params),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['brand', vars.brandId] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}
