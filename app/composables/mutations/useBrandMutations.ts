import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreateBrandRequest, UpdateBrandRequest } from '~/types'

export function useCreateBrand() {
  const { createBrand } = useBrandService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useUpdateBrand() {
  const { updateBrand } = useBrandService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateBrandRequest }) => updateBrand(vars.id, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['brand', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useDeleteBrand() {
  const { deleteBrand } = useBrandService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}
