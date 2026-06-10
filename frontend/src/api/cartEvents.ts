// src/api/cartEvents.ts
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
