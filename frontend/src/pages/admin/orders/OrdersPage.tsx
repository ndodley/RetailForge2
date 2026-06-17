import { useEffect, useMemo, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../../hooks/useAuth"
import AdminLayout from "../../../components/admin/AdminLayout"
import AdvancedSearchPanel from "../../../components/common/AdvancedSearchPanel"
import OrderTable from "../../../components/tables/OrderTable"

// TYPE‑ONLY IMPORTS (required by verbatimModuleSyntax)
import type { SearchSection } from "../../../components/common/AdvancedSearchPanel"
import type { OrderRecord } from "../../../components/tables/OrderTable"

import "./OrdersPage.css"

type UserRole = "CUSTOMER" | "MANAGER" | "EMPLOYEE" | "ADMIN"

function downloadCsv(rows: OrderRecord[], filename: string) {
    const header = ["id", "user_email", "status", "total", "created_at"]
    const csvRows = [
        header.join(","),
        ...rows.map((r) =>
            [
                r.id,
                r.user_email ?? "",
                r.status,
                r.total,
                r.created_at,
            ].join(",")
        ),
    ]

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()

    URL.revokeObjectURL(url)
}

export default function OrdersPage() {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const [orders, setOrders] = useState<OrderRecord[]>([])
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState("")
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState("All")

    const pageSize = 6

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }),
        []
    )

    const filterSections: SearchSection[] = useMemo(
        () => [
            {
                key: "status",
                title: "Status",
                type: "radio",
                value: statusFilter,
                onChange: (v) => setStatusFilter(String(v)),
                options: [
                    { value: "All", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                    { value: "shipped", label: "Shipped" },
                    { value: "cancelled", label: "Cancelled" },
                ],
            },
        ],
        [statusFilter]
    )

    const visibleOrders = useMemo(() => {
        const q = search.trim().toLowerCase()
        const status = statusFilter.toLowerCase()

        return orders.filter((order) => {
            const orderStatus = order.status.toLowerCase()
            if (status !== "all" && orderStatus !== status) return false
            if (!q) return true

            return (
                String(order.id).includes(q) ||
                (order.user_email ?? "").toLowerCase().includes(q) ||
                orderStatus.includes(q) ||
                String(order.total).includes(q)
            )
        })
    }, [orders, search, statusFilter])

    // FIX: Avoid synchronous state update inside effect
    useEffect(() => {
        queueMicrotask(() => {
            setPage((prev) => (prev !== 1 ? 1 : prev))
        })
    }, [visibleOrders.length])

    const handleDelete = async (orderId: number) => {
        if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return

        try {
            setDeletingId(orderId)
            await axios.delete(`/api/orders/${orderId}`)
            setOrders((prev) => prev.filter((o) => o.id !== orderId))
        } catch {
            setError("Failed to delete order.")
        } finally {
            setDeletingId(null)
        }
    }

    const handleEdit = (orderId: number) => {
        navigate(`/admin/orders/${orderId}?edit=1`)
    }

    useEffect(() => {
        async function load() {
            if (!user || !["ADMIN", "MANAGER"].includes(user.role as UserRole)) {
                setPageLoading(false)
                return
            }

            try {
                const res = await axios.get("/api/orders/admin")
                setOrders(Array.isArray(res.data) ? res.data : [])
            } catch {
                setError("Failed to load orders.")
            } finally {
                setPageLoading(false)
            }
        }

        if (!loading) void load() // FIX: Avoid unhandled promise warning
    }, [user, loading])

    if (loading) return <div className="admin-loading">Loading...</div>

    if (!user || !["ADMIN", "MANAGER"].includes(user.role as UserRole))
        return <Navigate to="/login" state={{ from: location }} replace />

    if (pageLoading) return <div className="admin-loading">Loading all orders...</div>

    const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const pagedOrders = visibleOrders.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    )

    return (
        <AdminLayout
            title="Manage Orders"
            subtitle="View all orders across the store, including the customer email."
            actions={
                <button
                    type="button"
                    className="admin-btn"
                    onClick={() => downloadCsv(orders, "orders.csv")}
                    disabled={orders.length === 0}
                >
                    Download CSV
                </button>
            }
        >
            {error && <div className="admin-alert admin-alert--error">{error}</div>}

            {!error && orders.length === 0 && (
                <div className="admin-empty">No orders found.</div>
            )}

            {!error && orders.length > 0 && (
                <div className="admin-search-panel">
                    <AdvancedSearchPanel
                        title="Advanced Search"
                        query={search}
                        onQueryChange={setSearch}
                        isOpen={filtersOpen}
                        onToggleOpen={() => setFiltersOpen((v) => !v)}
                        onSearch={() => setFiltersOpen(false)}
                        sections={filterSections}
                    />
                </div>
            )}

            {!error && orders.length > 0 && visibleOrders.length === 0 && (
                <div className="admin-empty">No matching orders.</div>
            )}

            {visibleOrders.length > 0 && (
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * pageSize + 1}–
                            {Math.min(safePage * pageSize, visibleOrders.length)} of{" "}
                            {visibleOrders.length}
                        </div>

                        <div className="admin-pagination-controls">
                            <button
                                className="admin-btn admin-btn--sm"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>

                            <div className="admin-pagination-meta">
                                Page {safePage} / {totalPages}
                            </div>

                            <button
                                className="admin-btn admin-btn--sm"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <OrderTable
                        orders={pagedOrders}
                        currencyFormatter={currencyFormatter}
                        deletingId={deletingId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </>
            )}
        </AdminLayout>
    )
}
