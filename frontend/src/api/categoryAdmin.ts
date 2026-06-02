import axios from 'axios'

export interface CategoryAdminDto {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
}

export interface CategoryAdminWriteDto {
  name: string
  description: string
  departmentId: number
}

export interface CategoryAdminBulkRowDto {
  name: string
  description: string
  departmentId?: number
  departmentName?: string
}

export interface CategoryAdminBulkOperationResultDto {
  inserted: number
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

async function fetchCategories() {
  const { data } = await apiClient.get<CategoryAdminDto[]>('/api/categories')
  return data
}

async function createCategory(payload: CategoryAdminWriteDto) {
  const { data } = await apiClient.post<CategoryAdminDto>('/api/categories', payload)
  return data
}

async function updateCategory(id: number, payload: CategoryAdminWriteDto) {
  const { data } = await apiClient.put<CategoryAdminDto>(`/api/categories/${id}`, payload)
  return data
}

async function deleteCategory(id: number) {
  await apiClient.delete(`/api/categories/${id}`)
}

async function bulkCreateCategories(rows: CategoryAdminBulkRowDto[]) {
  const { data } = await apiClient.post<CategoryAdminBulkOperationResultDto>('/api/categories/bulk', { rows })
  return data
}

const categoryAdminApi = {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
}

export default categoryAdminApi

