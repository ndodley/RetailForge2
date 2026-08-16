import api, { getApiErrorMessage, API_BASE_URL, type BulkOperationResultDto } from './apiClient';

export interface ProductDto {
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

export interface ProductBulkRowDto {
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

export { API_BASE_URL };
export const DEFAULT_PRODUCT_IMAGE_PATH = '/images/other_images/dummy_product.jpg';

export async function fetchStoreProducts() {
  const { data } = await api.get<ProductDto[]>('/api/products');
  return data;
}

export async function fetchStoreProductById(id: number) {
  const { data } = await api.get<ProductDto>(`/api/products/${id}`);
  return data;
}

// Admin CRUD — merged in from the former productAdminApi.ts. It hit the same
// /api/products endpoints as the reads above, so it now shares this file's
// api client (apiClient) instead of creating its own separate axios instance.
export async function createProduct(formData: FormData) {
  const { data } = await api.post<ProductDto>('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id: number, formData: FormData) {
  const { data } = await api.put<ProductDto>(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id: number) {
  await api.delete(`/api/products/${id}`);
}

export async function bulkCreateProducts(rows: ProductBulkRowDto[]) {
  const { data } = await api.post<BulkOperationResultDto>(
      '/api/products/bulk',
      { rows },
      { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
}

export function buildBackendImageUrl(imagePath: string | null | undefined) {
  const normalized = imagePath?.trim() || DEFAULT_PRODUCT_IMAGE_PATH;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_BASE_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

export const getProductApiErrorMessage = getApiErrorMessage;
