import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchFavoriteProductIds, addFavorite, removeFavorite } from '../api/favorites'
import { FavoritesContext, type FavoritesContextValue } from './favoritesContextShared'

interface FavoritesProviderProps {
  children: ReactNode
}

// The FavoritesProvider tracks which product IDs the current user has favorited,
// so any ProductCard on any page can show the correct star state and toggle it
// without each component needing its own fetch.
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!user) {
        if (mounted) {
          setFavoriteIds(new Set())
          setLoading(false)
        }
        return
      }

      setLoading(true)
      try {
        const ids = await fetchFavoriteProductIds(user.id)
        if (mounted) {
          setFavoriteIds(new Set(ids))
        }
      } catch {
        if (mounted) {
          setFavoriteIds(new Set())
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [user])

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (productId: number) => favoriteIds.has(productId),
      toggleFavorite: async (productId: number) => {
        if (!user) return

        const currentlyFavorite = favoriteIds.has(productId)

        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (currentlyFavorite) {
            next.delete(productId)
          } else {
            next.add(productId)
          }
          return next
        })

        try {
          if (currentlyFavorite) {
            await removeFavorite(user.id, productId)
          } else {
            await addFavorite(user.id, productId)
          }
        } catch {
          // Revert the optimistic update if the request failed.
          setFavoriteIds((prev) => {
            const next = new Set(prev)
            if (currentlyFavorite) {
              next.add(productId)
            } else {
              next.delete(productId)
            }
            return next
          })
        }
      },
      loading,
    }),
    [favoriteIds, loading, user],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
