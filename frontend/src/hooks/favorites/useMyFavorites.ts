import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../useAuth"
import { fetchFavoriteProducts, getFavoriteApiErrorMessage } from "../../api/favorites"
import type { StoreProductDto } from "../../api/products"

export function useMyFavorites() {
    const { user, loading } = useAuth()

    const [products, setProducts] = useState<StoreProductDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const loadFavorites = useCallback(async () => {
        if (!user) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setErrorMessage("")

        try {
            const data = await fetchFavoriteProducts(user.id)
            setProducts(data)
        } catch (error) {
            setErrorMessage(getFavoriteApiErrorMessage(error, "Unable to load your favorites."))
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!loading && user) {
            void loadFavorites()
        }
        if (!loading && !user) {
            setIsLoading(false)
        }
    }, [loading, user, loadFavorites])

    return {
        products,
        isLoading,
        errorMessage,
        reload: loadFavorites,
    }
}
