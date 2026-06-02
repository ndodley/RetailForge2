import axios from 'axios'

export interface CategoryDto {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
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

export interface BulkOperationResultDto {
  inserted: number
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function fetchCategories() {
  const { data } = await apiClient.get<CategoryDto[]>('/api/categories')
  return data
}

export async function fetchCategoryById(id: number) {
  const { data } = await apiClient.get<CategoryDto>(`/api/categories/${id}`)
  return data
}

export async function createCategory(payload: CategoryWriteDto) {
  const { data } = await apiClient.post<CategoryDto>('/api/categories', payload)
  return data
}

export async function updateCategory(id: number, payload: CategoryWriteDto) {
  const { data } = await apiClient.put<CategoryDto>(`/api/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: number) {
  await apiClient.delete(`/api/categories/${id}`)
}

export async function bulkCreateCategories(rows: CategoryBulkRowDto[]) {
  const { data } = await apiClient.post<BulkOperationResultDto>('/api/categories/bulk', { rows })
  return data
}

const categoriesApi = {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
}

export default categoriesApi

