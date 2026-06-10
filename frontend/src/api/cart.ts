import api from './axios'
import { notifyCartChanged } from './cartEvents'

export interface CartItem {
    id: number
    productId: number
    name: string
    categoryName: string | null
    imagePath: string | null
    price: number
    quantity: number
    stock: number
}

export interface CartDto {
    id: number
    items: CartItem[]
    subtotal: number
    totalItems: number
}

export async function fetchCart(): Promise<CartDto> {
    const { data } = await api.get<CartDto>('/api/cart')
    return data
}

// ⭐ CORRECT — backend uses POST + query params
export async function addProductToCart(productId: number): Promise<CartDto> {
    const { data } = await api.post<CartDto>('/api/cart/items', null, {
        params: { productId, quantity: 1 },
    })
    notifyCartChanged()
    return data
}

// ⭐ CORRECT — backend uses PATCH + query param
export async function updateCartQuantity(productId: number, quantity: number): Promise<CartDto> {
    const { data } = await api.patch<CartDto>(`/api/cart/items/${productId}`, null, {
        params: { quantity },
    })
    notifyCartChanged()
    return data
}

export async function removeFromCart(productId: number): Promise<CartDto> {
    const { data } = await api.delete<CartDto>(`/api/cart/items/${productId}`)
    notifyCartChanged()
    return data
}

export async function clearCartApi(): Promise<CartDto> {
    const { data } = await api.delete<CartDto>('/api/cart')
    notifyCartChanged()
    return data
}
