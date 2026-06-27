import api from './axios'
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

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (typeof responseData === 'string' && responseData.trim()) {
      const trimmed = responseData.trim()
      if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
        return fallback
      }
      return trimmed
    }

    if (responseData && typeof responseData === 'object') {
      const record = responseData as Record<string, unknown>
      const message = record.message
      const errorMessage = record.error
      const detail = record.detail
      const title = record.title

      if (typeof message === 'string' && message.trim()) return message
      if (typeof errorMessage === 'string' && errorMessage.trim()) return errorMessage
      if (typeof detail === 'string' && detail.trim()) return detail
      if (typeof title === 'string' && title.trim()) return title
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
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
