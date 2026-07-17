import { useState } from "react"
import { Navigate, useLocation, Link } from "react-router-dom"
import "./MyFavoritesPage.css"

import Layout from "../../components/common/Layout"
import AdvancedSearchPanel from "../../components/common/AdvancedSearchPanel"
import ProductCard from "../../components/common/ProductCard"
import { useAuth } from "../../hooks/useAuth"
import { useFavorites } from "../../hooks/useFavorites"
import { useMyFavorites } from "../../hooks/favorites/useMyFavorites"
import { useMyFavoriteFilters } from "../../hooks/favorites/useMyFavoriteFilters"
import { usePagination } from "../../hooks/usePagination"
import { useStorefrontData } from "../../hooks/products/useStorefrontData"

const PAGE_SIZE = 8

function MyFavoritesPage() {
    const { user, loading } = useAuth()
    const location = useLocation()
    const { favoriteIds } = useFavorites()

    const { products, isLoading, errorMessage } = useMyFavorites()
    const { categories, departments } = useStorefrontData()

    // The shared favorites context is the live source of truth for star state,
    // so filter the fetched list against it — unfavoriting a card here removes
    // it from the grid immediately instead of waiting on a refetch.
    const currentFavorites = products.filter((p) => favoriteIds.has(p.id))

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleProducts,
        resetFilters,
    } = useMyFavoriteFilters(currentFavorites, categories, departments)

    const [filtersOpen, setFiltersOpen] = useState(false)

    const {
        setPage,
        safePage,
        totalPages,
        pagedItems,
    } = usePagination(visibleProducts, PAGE_SIZE)

    if (loading) {
        return <div className="myfav-fullscreen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (isLoading) {
        return <div className="myfav-fullscreen">Loading your favorites...</div>
    }

    return (
        <Layout isStorefront>
            <div className="myfav-page">
                <div className="myfav-browse-row">
                    <Link to="/products" className="myfav-browse-link">
                        Browse products
                    </Link>
                </div>

                <div className="myfav-panel">
                    <div className="myfav-panel-header">
                        <h2 className="myfav-title">My Favorites</h2>
                    </div>

                    <div className="myfav-panel-body">
                        <div className="myfav-search-wrap">
                            <AdvancedSearchPanel
                                title="Advanced Search"
                                query={searchTerm}
                                onQueryChange={setSearchTerm}
                                isOpen={filtersOpen}
                                onToggleOpen={() => setFiltersOpen((v) => !v)}
                                onSearch={() => setFiltersOpen(false)}
                                onReset={resetFilters}
                                sections={filterSections}
                            />
                        </div>

                        {errorMessage && <div className="myfav-error">{errorMessage}</div>}

                        {!errorMessage && currentFavorites.length === 0 && (
                            <div className="myfav-empty">
                                You don&apos;t have any favorites yet.{" "}
                                <Link to="/products" className="myfav-empty-link">
                                    Go to the products page
                                </Link>{" "}
                                and click the star on any item.
                            </div>
                        )}

                        {!errorMessage && currentFavorites.length > 0 && visibleProducts.length === 0 && (
                            <div className="myfav-empty">No favorites match your search.</div>
                        )}

                        {!errorMessage && visibleProducts.length > 0 && (
                            <div className="myfav-results-bar">
                                <div className="myfav-results-copy">
                                    Showing {(safePage - 1) * PAGE_SIZE + 1}-
                                    {Math.min(safePage * PAGE_SIZE, visibleProducts.length)} of{" "}
                                    {visibleProducts.length}
                                </div>

                                <div className="myfav-pagination">
                                    <button
                                        type="button"
                                        className="myfav-page-btn"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Prev
                                    </button>

                                    <span className="myfav-page-info">
                                        Page {safePage} / {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        className="myfav-page-btn"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {pagedItems.length > 0 && (
                            <div className="myfav-grid">
                                {pagedItems.map((product) => (
                                    <div key={product.id} className="myfav-grid-item">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MyFavoritesPage
