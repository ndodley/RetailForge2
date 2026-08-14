import api, { getApiErrorMessage, type BulkOperationResultDto } from './apiClient'

export interface CategoryDto {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
  productCount: number
}

export interface CategoryWriteDto {
  name: string
  description: string
  departmentId: number
}

export interface CategoryBulkRowDto {
  name: string
  description: string
  departmentId?: number
  departmentName?: string
}

export async function fetchCategories() {
  const { data } = await api.get<CategoryDto[]>('/api/categories')
  return data
}

export async function fetchCategoryById(id: number) {
  const { data } = await api.get<CategoryDto>(`/api/categories/${id}`)
  return data
}

export async function createCategory(payload: CategoryWriteDto) {
  const { data } = await api.post<CategoryDto>('/api/categories', payload)
  return data
}

export async function updateCategory(id: number, payload: CategoryWriteDto) {
  const { data } = await api.put<CategoryDto>(`/api/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: number) {
  await api.delete(`/api/categories/${id}`)
}

export async function bulkCreateCategories(rows: CategoryBulkRowDto[]) {
  const { data } = await api.post<BulkOperationResultDto>('/api/categories/bulk', { rows })
  return data
}

export const getCategoryApiErrorMessage = getApiErrorMessage

