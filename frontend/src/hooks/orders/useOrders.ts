import { useState, useEffect } from "react"
import {
    fetchOrders,
    deleteOrder,
    getOrderApiErrorMessage,
} from "../../api/orders.ts"
import type { OrderRecord } from "../../types/store.ts"

export function useOrders() {
    const [orders, setOrders] = useState<OrderRecord[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            setErrorMessage("")

            try {
                const data = await fetchOrders()
                setOrders(data)
            } catch (error) {
                setErrorMessage(getOrderApiErrorMessage(error, "Unable to load orders."))
            } finally {
                setIsLoading(false)
            }
        }

        void load()
    }, [])

    function clearMessages() {
        setErrorMessage("")
        setSuccessMessage("")
    }

    async function handleDeleteOrder(id: number) {
        if (!window.confirm("Are you sure you want to delete this order?")) return

        clearMessages()

        try {
            await deleteOrder(id)
            setOrders((prev) => prev.filter((o) => o.id !== id))
            setSuccessMessage("Order deleted successfully.")
        } catch (error) {
            setErrorMessage(getOrderApiErrorMessage(error, "Unable to delete order."))
        }
    }

    return {
        orders,
        isLoading,
        errorMessage,
        successMessage,
        clearMessages,
        handleDeleteOrder,
    }
}