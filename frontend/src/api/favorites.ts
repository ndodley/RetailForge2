import api, { getApiErrorMessage } from "./apiClient"
import type { ProductDto } from "./products"

export interface FavoriteDto {
    id: number
    userId: number
    productId: number
    createdAt: string
}

export async function fetchFavoriteProducts(userId: number) {
    const { data } = await api.get<ProductDto[]>(`/api/favorites/user/${userId}`)
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

export const getFavoriteApiErrorMessage = getApiErrorMessage
