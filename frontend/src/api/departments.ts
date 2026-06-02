import axios from 'axios'

export interface DepartmentDto {
  id: number
  name: string
}

export interface DepartmentWriteDto {
  name: string
}

export interface DepartmentBulkRowDto {
  name: string
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

export async function fetchDepartments() {
  const { data } = await apiClient.get<DepartmentDto[]>('/api/departments')
  return data
}

export async function fetchDepartmentById(id: number) {
  const { data } = await apiClient.get<DepartmentDto>(`/api/departments/${id}`)
  return data
}

export async function createDepartment(payload: DepartmentWriteDto) {
  const { data } = await apiClient.post<DepartmentDto>('/api/departments', payload)
  return data
}

export async function updateDepartment(id: number, payload: DepartmentWriteDto) {
  const { data } = await apiClient.put<DepartmentDto>(`/api/departments/${id}`, payload)
  return data
}

export async function deleteDepartment(id: number) {
  await apiClient.delete(`/api/departments/${id}`)
}

export async function bulkCreateDepartments(rows: DepartmentBulkRowDto[]) {
  const { data } = await apiClient.post<BulkOperationResultDto>('/api/departments/bulk', { rows })
  return data
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (typeof responseData === 'string' && responseData.trim()) {
      const trimmedResponse = responseData.trim()
      if (trimmedResponse.startsWith('<!doctype html') || trimmedResponse.startsWith('<html')) {
        return fallback
      }

      return responseData
    }

    if (responseData && typeof responseData === 'object') {
      const record = responseData as Record<string, unknown>
      const message = record.message
      const errorMessage = record.error
      const detail = record.detail
      const title = record.title

      if (typeof message === 'string' && message.trim()) {
        return message
      }

      if (typeof errorMessage === 'string' && errorMessage.trim()) {
        return errorMessage
      }

      if (typeof detail === 'string' && detail.trim()) {
        return detail
      }

      if (typeof title === 'string' && title.trim()) {
        return title
      }
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

