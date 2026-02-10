import { useQuery } from '@tanstack/vue-query'
import type { ListSegmentsParams } from '~/types'

export function useSegmentsQuery(params: Ref<ListSegmentsParams> | ListSegmentsParams = {}) {
  const { listSegments } = useSegmentService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['segments', resolvedParams] as const,
    queryFn: () => listSegments(toValue(resolvedParams)),
  })
}

export function useSegmentQuery(id: Ref<string> | string) {
  const { getSegment } = useSegmentService()
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery({
    queryKey: ['segment', resolvedId] as const,
    queryFn: () => getSegment(toValue(resolvedId)),
    enabled: () => !!toValue(resolvedId),
  })
}
