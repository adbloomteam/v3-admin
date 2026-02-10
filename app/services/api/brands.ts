import type { Brand, ApiSuccess, CreateBrandRequest, UpdateBrandRequest, ListBrandsParams } from '~/types'

export function useBrandService() {
  const { apiFetch } = useApi()

  async function listBrands(params: ListBrandsParams = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.perPage) query.set('perPage', String(params.perPage))
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return apiFetch<{ data: Brand[]; count: number; page: number; perPage: number }>(`/brands${qs ? `?${qs}` : ''}`)
  }

  async function getBrand(id: string): Promise<Brand> {
    return apiFetch<Brand>(`/brands/${id}`)
  }

  async function createBrand(data: CreateBrandRequest): Promise<{ data: Brand }> {
    return apiFetch<{ data: Brand }>('/brands', { method: 'POST', body: data })
  }

  async function updateBrand(id: string, data: UpdateBrandRequest): Promise<{ data: Brand }> {
    return apiFetch<{ data: Brand }>(`/brands/${id}`, { method: 'PUT', body: data })
  }

  async function deleteBrand(id: string): Promise<ApiSuccess> {
    return apiFetch<ApiSuccess>(`/brands/${id}`, { method: 'DELETE' })
  }

  return { listBrands, getBrand, createBrand, updateBrand, deleteBrand }
}
