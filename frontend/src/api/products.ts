import api from './axios';
import axios from "axios";

export interface StoreProductDto {
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

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export const DEFAULT_PRODUCT_IMAGE_PATH = '/images/other_images/dummy_product.jpg';

export async function fetchStoreProducts() {
  const { data } = await api.get<StoreProductDto[]>('/api/products');
  return data;
}

export async function fetchStoreProductById(id: number) {
  const { data } = await api.get<StoreProductDto>(`/api/products/${id}`);
  return data;
}

export function buildBackendImageUrl(imagePath: string | null | undefined) {
  const normalized = imagePath?.trim() || DEFAULT_PRODUCT_IMAGE_PATH;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_BASE_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

export function getProductApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
