import { useState } from "react"
import { Navigate, useLocation, Link } from "react-router-dom"
import "./MyOrdersPage.css"

import Layout from "../../components/common/Layout"
import AdvancedSearchPanel from "../../components/common/AdvancedSearchPanel"
import { useAuth } from "../../hooks/useAuth"
import { useMyOrders } from "../../hooks/orders/useMyOrders"
import { useMyOrderFilters } from "../../hooks/orders/useMyOrderFilters"
import { usePagination } from "../../hooks/usePagination"
import MyOrderTable from "../../components/tables/order/MyOrderTable"

const PAGE_SIZE = 6

function MyOrdersPage() {
    const { user, loading } = useAuth()
    const location = useLocation()

    const { orders, isLoading, errorMessage } = useMyOrders()

    const {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleOrders,
        resetFilters,
    } = useMyOrderFilters(orders)

    const [filtersOpen, setFiltersOpen] = useState(false)

    const {
        setPage,
        safePage,
        totalPages,
        pagedItems,
    } = usePagination(visibleOrders, PAGE_SIZE)

    if (loading) {
        return <div className="myord-fullscreen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (isLoading) {
        return <div className="myord-fullscreen">Loading your orders...</div>
    }

    return (
        <Layout isStorefront>
            <div className="myord-page">
                <div className="myord-browse-row">
                    <Link to="/products" className="myord-browse-link">
                        Browse products
                    </Link>
                </div>

                <div className="myord-panel">
                    <div className="myord-panel-header">
                        <h2 className="myord-title">My Orders</h2>
                        <div className="myord-subtitle">
                            View your past orders and the items purchased in each order.
                        </div>
                    </div>

                    <div className="myord-panel-body">
                        {errorMessage && <div className="myord-error">{errorMessage}</div>}

                        {!errorMessage && orders.length === 0 && (
                            <div className="myord-empty">
                                You have no orders yet.{" "}
                                <Link to="/products" className="myord-empty-link">
                                    Browse products
                                </Link>
                            </div>
                        )}

                        {!errorMessage && orders.length > 0 && (
                            <div className="myord-search-wrap">
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
                        )}

                        {!errorMessage && orders.length > 0 && visibleOrders.length === 0 && (
                            <div className="myord-empty">
                                No orders match your search.
                            </div>
                        )}

                        {!errorMessage && visibleOrders.length > 0 && (
                            <div className="myord-results-bar">
                                <div className="myord-results-copy">
                                    Showing {(safePage - 1) * PAGE_SIZE + 1}-
                                    {Math.min(safePage * PAGE_SIZE, visibleOrders.length)} of{" "}
                                    {visibleOrders.length}
                                </div>

                                <div className="myord-pagination">
                                    <button
                                        type="button"
                                        className="myord-page-btn"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Prev
                                    </button>

                                    <span className="myord-page-info">
                                        Page {safePage} / {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        className="myord-page-btn"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {pagedItems.length > 0 && <MyOrderTable items={pagedItems} />}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MyOrdersPage