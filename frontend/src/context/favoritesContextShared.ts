import { createContext } from 'react'

export interface FavoritesContextValue {
  favoriteIds: Set<number>
  isFavorite: (productId: number) => boolean
  toggleFavorite: (productId: number) => Promise<void>
  loading: boolean
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)
