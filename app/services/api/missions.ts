import type { Mission, MissionDetail, MissionStatus, ApiSuccess, CreateMissionRequest, UpdateMissionRequest, ListMissionsParams } from '~/types'

export function useMissionService() {
  const { apiFetch } = useApi()

  async function listMissions(params: ListMissionsParams = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.status) query.set('status', params.status)
    if (params.type) query.set('type', params.type)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<{ data: Mission[]; count: number; page: number; perPage: number }>(`/missions${qs ? `?${qs}` : ''}`)
  }

  async function getMission(id: string): Promise<MissionDetail> {
    return apiFetch<MissionDetail>(`/missions/${id}`)
  }

  async function createMission(data: CreateMissionRequest): Promise<{ data: Mission }> {
    return apiFetch<{ data: Mission }>('/missions', { method: 'POST', body: data })
  }

  async function updateMission(id: string, data: UpdateMissionRequest): Promise<{ data: Mission }> {
    return apiFetch<{ data: Mission }>(`/missions/${id}`, { method: 'PATCH', body: data })
  }

  async function updateMissionStatus(id: string, status: MissionStatus): Promise<{ data: Mission }> {
    return apiFetch<{ data: Mission }>(`/missions/${id}/status`, { method: 'PATCH', body: { status } })
  }

  async function deleteMission(id: string): Promise<ApiSuccess> {
    return apiFetch<ApiSuccess>(`/missions/${id}`, { method: 'DELETE' })
  }

  return { listMissions, getMission, createMission, updateMission, updateMissionStatus, deleteMission }
}
