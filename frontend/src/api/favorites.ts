import axios from "axios"
import api from "./axios"
import type { StoreProductDto } from "./products"

export interface FavoriteDto {
    id: number
    userId: number
    productId: number
    createdAt: string
}

export async function fetchFavoriteProducts(userId: number) {
    const { data } = await api.get<StoreProductDto[]>(`/api/favorites/user/${userId}`)
    return data
}

export async function fetchFavoriteProductIds(userId: number) {
    const { data } = await api.get<number[]>(`/api/favorites/user/${userId}/ids`)
    return data
}

export async function addFavorite(userId: number, productId: number) {
    const { data } = await api.post<FavoriteDto>(`/api/favorites/user/${userId}/product/${productId}`)
    return data
}

export async function removeFavorite(userId: number, productId: number) {
    await api.delete(`/api/favorites/user/${userId}/product/${productId}`)
}

export function getFavoriteApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback
    }
    if (error instanceof Error) {
        return error.message
    }
    return fallback
}
