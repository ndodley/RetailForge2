import api from './axios';
import axios from 'axios';

export interface DepartmentDto {
  id: number;
  name: string;
  categoryCount: number;
  productCount: number;
}

export interface DepartmentWriteDto {
  name: string;
}

export interface DepartmentBulkRowDto {
  name: string;
}

export interface BulkOperationResultDto {
  inserted: number;
}

export async function fetchDepartments() {
  const { data } = await api.get<DepartmentDto[]>('/api/departments');
  return data;
}

export async function fetchDepartmentById(id: number) {
  const { data } = await api.get<DepartmentDto>(`/api/departments/${id}`);
  return data;
}

export async function createDepartment(payload: DepartmentWriteDto) {
  const { data } = await api.post<DepartmentDto>('/api/departments', payload);
  return data;
}

export async function updateDepartment(id: number, payload: DepartmentWriteDto) {
  const { data } = await api.put<DepartmentDto>(`/api/departments/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: number) {
  await api.delete(`/api/departments/${id}`);
}

export async function bulkCreateDepartments(rows: DepartmentBulkRowDto[]) {
  const { data } = await api.post<BulkOperationResultDto>('/api/departments/bulk', { rows });
  return data;
}

// Keep your error helper
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      const trimmed = responseData.trim();
      if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
        return fallback;
      }
      return trimmed;
    }

    if (responseData && typeof responseData === 'object') {
      const record = responseData as Record<string, unknown>;
      const message = record.message;
      const errorMessage = record.error;
      const detail = record.detail;
      const title = record.title;

      if (typeof message === 'string' && message.trim()) return message;
      if (typeof errorMessage === 'string' && errorMessage.trim()) return errorMessage;
      if (typeof detail === 'string' && detail.trim()) return detail;
      if (typeof title === 'string' && title.trim()) return title;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
