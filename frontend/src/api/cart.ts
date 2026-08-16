import api from './apiClient'

export interface CartItem {
    id: number
    productId: number
    productName: string
    brand: string | null
    categoryName: string | null
    imagePath: string | null
    priceAtTime: number
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

// Lightweight pub/sub so components outside the cart flow (e.g. the navbar's
// cart count badge) can react when the cart changes, without needing a full
// store. Merged in from the former cartEvents.ts — the cart API and its
// change notifications are one concern, not two files.
type CartListener = () => void

const listeners = new Set<CartListener>()

export function subscribeToCartChanges(listener: CartListener) {
    listeners.add(listener)

    // Cleanup returns void, not boolean
    return () => {
        listeners.delete(listener)
    }
}

export function notifyCartChanged() {
    for (const listener of listeners) {
        listener()
    }
}
