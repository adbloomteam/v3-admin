import type { Segment, SegmentPreview, ApiSuccess, CreateSegmentRequest, UpdateSegmentRequest, ListSegmentsParams } from '~/types'

export function useSegmentService() {
  const { apiFetch } = useApi()

  async function listSegments(params: ListSegmentsParams = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    const qs = query.toString()
    return apiFetch<{ segments: Segment[]; total: number; page: number; perPage: number }>(`/segments${qs ? `?${qs}` : ''}`)
  }

  async function getSegment(id: string): Promise<{ segment: Segment }> {
    return apiFetch<{ segment: Segment }>(`/segments/${id}`)
  }

  async function createSegment(data: CreateSegmentRequest): Promise<{ segment: Segment }> {
    return apiFetch<{ segment: Segment }>('/segments', { method: 'POST', body: data })
  }

  async function updateSegment(id: string, data: UpdateSegmentRequest): Promise<{ segment: Segment }> {
    return apiFetch<{ segment: Segment }>(`/segments/${id}`, { method: 'PATCH', body: data })
  }

  async function deleteSegment(id: string): Promise<ApiSuccess> {
    return apiFetch<ApiSuccess>(`/segments/${id}`, { method: 'DELETE' })
  }

  async function previewSegment(id: string): Promise<SegmentPreview> {
    return apiFetch<SegmentPreview>(`/segments/${id}/preview`)
  }

  return { listSegments, getSegment, createSegment, updateSegment, deleteSegment, previewSegment }
}
