import axios from 'axios';

// Shared backend base URL. Was previously redeclared independently in
// products.ts and inline (as a lowercase `apiBaseUrl` constant) in ~10
// components/pages that build image/avatar URLs — centralized here since
// this is where the axios instance's own baseURL already comes from.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// Create a dedicated axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // REQUIRED for Spring Session cookies
});

// Optional: Add interceptors (recommended for real apps)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can add global error handling here later
        return Promise.reject(error);
    }
);

export default api;

// Shared bulk-upload result shape. The departments/categories/products admin
// bulk-upload endpoints all return this same { inserted } payload, so it
// lives here once instead of being redeclared in each api file.
export interface BulkOperationResultDto {
    inserted: number;
}

// Shared API-error-message helper used across every entity api file. Each
// one re-exports this under its own name (e.g. getDepartmentApiErrorMessage)
// so existing call sites don't need to change, but there's only one
// implementation to maintain.
export function getApiErrorMessage(error: unknown, fallback: string): string {
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
