import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UploadMissionImageParams, UploadAvatarParams } from '~/services/api/upload'

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
