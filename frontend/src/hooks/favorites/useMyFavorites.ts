import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../useAuth"
import { fetchFavoriteProducts, getFavoriteApiErrorMessage } from "../../api/favorites"
import type { ProductDto } from "../../api/products"

export function useMyFavorites() {
    const { user, loading } = useAuth()

    const [products, setProducts] = useState<ProductDto[]>([])
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
            // Kicks off the fetch once auth resolves; loadFavorites owns its
            // own loading/error state, this just triggers it.
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
