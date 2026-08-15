import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../useAuth"
import { fetchOrdersByUserId, getOrderApiErrorMessage } from "../../api/orders"
import type { OrderRecord } from "../../types/store"

export function useMyOrders() {
    const { user, loading } = useAuth()

    const [orders, setOrders] = useState<OrderRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const loadOrders = useCallback(async () => {
        if (!user) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setErrorMessage("")

        try {
            const data = await fetchOrdersByUserId(user.id)
            setOrders(data)
        } catch (error) {
            setErrorMessage(getOrderApiErrorMessage(error, "Unable to load your orders."))
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!loading && user) {
            // Kicks off the fetch once auth resolves; loadOrders owns its
            // own loading/error state, this just triggers it.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void loadOrders()
        }
        if (!loading && !user) {
            setIsLoading(false)
        }
    }, [loading, user, loadOrders])

    return {
        orders,
        isLoading,
        errorMessage,
        reload: loadOrders,
    }
}