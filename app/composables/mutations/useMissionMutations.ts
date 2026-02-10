import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreateMissionRequest, UpdateMissionRequest, MissionStatus } from '~/types'

export function useCreateMission() {
  const { createMission } = useMissionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMissionRequest) => createMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

export function useUpdateMission() {
  const { updateMission } = useMissionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateMissionRequest }) => updateMission(vars.id, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['mission', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

export function useUpdateMissionStatus() {
  const { updateMissionStatus } = useMissionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; status: MissionStatus }) => updateMissionStatus(vars.id, vars.status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['mission', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteMission() {
  const { deleteMission } = useMissionService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
