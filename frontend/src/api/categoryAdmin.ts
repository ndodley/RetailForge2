import api from './axios';

export interface CategoryAdminDto {
  id: number;
  name: string;
  description: string;
  departmentId: number | null;
  departmentName: string | null;
}

export interface CategoryAdminWriteDto {
  name: string;
  description: string;
  departmentId: number;
}

export interface CategoryAdminBulkRowDto {
  name: string;
  description: string;
  departmentId?: number;
  departmentName?: string;
}

export interface CategoryAdminBulkOperationResultDto {
  inserted: number;
}

async function fetchCategories() {
  const { data } = await api.get<CategoryAdminDto[]>('/api/categories');
  return data;
}

async function createCategory(payload: CategoryAdminWriteDto) {
  const { data } = await api.post<CategoryAdminDto>('/api/categories', payload);
  return data;
}

async function updateCategory(id: number, payload: CategoryAdminWriteDto) {
  const { data } = await api.put<CategoryAdminDto>(`/api/categories/${id}`, payload);
  return data;
}

async function deleteCategory(id: number) {
  await api.delete(`/api/categories/${id}`);
}

async function bulkCreateCategories(rows: CategoryAdminBulkRowDto[]) {
  const { data } = await api.post<CategoryAdminBulkOperationResultDto>('/api/categories/bulk', { rows });
  return data;
}

export default {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
};
