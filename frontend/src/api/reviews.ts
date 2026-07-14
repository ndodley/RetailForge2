import api from './axios'
import axios from 'axios'

export interface ReviewDto {
    id: number
    productId: number
    productName: string
    productImagePath: string | null
    userId: number
    userEmail: string
    userFullName: string
    rating: number
    comment: string
    created_at: string
    updated_at: string
}

export interface ReviewWriteDto {
    productId: number
    userId: number
    rating: number
    comment: string
}

export interface ReviewBulkUploadRowDto {
    productName: string
    userEmail: string
    rating: number
    comment: string
}

export interface ReviewBulkResultDto {
    inserted: number
}

export async function fetchReviews() {
    const { data } = await api.get<ReviewDto[]>('/api/reviews')
    return data
}

export async function fetchReviewsByProduct(productId: number) {
    const { data } = await api.get<ReviewDto[]>(`/api/reviews/product/${productId}`)
    return data
}

export async function fetchReviewsByUser(userId: number) {
    const { data } = await api.get<ReviewDto[]>(`/api/reviews/user/${userId}`)
    return data
}

export async function createReview(payload: ReviewWriteDto) {
    const { data } = await api.post<ReviewDto>('/api/reviews', payload)
    return data
}

export async function updateReview(id: number, payload: ReviewWriteDto) {
    const { data } = await api.put<ReviewDto>(`/api/reviews/${id}`, payload)
    return data
}

export async function deleteReview(id: number) {
    await api.delete(`/api/reviews/${id}`)
}

export async function bulkCreateReviews(rows: ReviewBulkUploadRowDto[]) {
    const { data } = await api.post<ReviewBulkResultDto>('/api/reviews/bulk', { rows })
    return data
}

export function getReviewApiErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data
        if (responseData && typeof responseData === 'object' && 'message' in responseData) {
            return (responseData as { message: string }).message
        }
    }
    return fallback
}