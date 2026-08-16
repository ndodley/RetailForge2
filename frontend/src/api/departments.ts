import api, { getApiErrorMessage, type BulkOperationResultDto } from './apiClient';

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

export const getDepartmentApiErrorMessage = getApiErrorMessage;
