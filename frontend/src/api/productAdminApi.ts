import axios from 'axios';

export interface ProductAdminDto {
  id: number;
  name: string;
  brand: string | null;
  rating: number;
  price: number;
  description: string;
  stock: number;
  imagePath: string | null;
  categoryId: number | null;
  categoryName: string | null;
  departmentId: number | null;
  departmentName: string | null;
}

export interface ProductAdminBulkRowDto {
  name: string;
  brand?: string;
  rating?: number;
  description: string;
  price: number;
  stock: number;
  categoryName: string;
  departmentName?: string;
  imagePath?: string;
}

export interface ProductAdminBulkResultDto {
  inserted: number;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
});

export async function fetchProducts() {
  const { data } = await apiClient.get<ProductAdminDto[]>('/api/products');
  return data;
}

export async function createProduct(formData: FormData) {
  const { data } = await apiClient.post<ProductAdminDto>('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id: number, formData: FormData) {
  const { data } = await apiClient.put<ProductAdminDto>(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id: number) {
  await apiClient.delete(`/api/products/${id}`);
}

export async function bulkCreateProducts(rows: ProductAdminBulkRowDto[]) {
  const { data } = await apiClient.post<ProductAdminBulkResultDto>(
      '/api/products/bulk',
      { rows },
      { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
}
