import { useQuery } from '@tanstack/vue-query'
import type { ListBrandsParams } from '~/types'

export function useBrandsQuery(params: Ref<ListBrandsParams> | ListBrandsParams = {}) {
  const { listBrands } = useBrandService()
  const resolvedParams = isRef(params) ? params : ref(params)

  return useQuery({
    queryKey: ['brands', resolvedParams] as const,
    queryFn: () => listBrands(toValue(resolvedParams)),
  })
}

export function useBrandQuery(id: Ref<string> | string) {
  const { getBrand } = useBrandService()
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery({
    queryKey: ['brand', resolvedId] as const,
    queryFn: () => getBrand(toValue(resolvedId)),
    enabled: () => !!toValue(resolvedId),
  })
}

export function useAllBrandsQuery() {
  const { listBrands } = useBrandService()

  return useQuery({
    queryKey: ['brands', 'all'] as const,
    queryFn: () => listBrands({ perPage: 100 }),
  })
}
