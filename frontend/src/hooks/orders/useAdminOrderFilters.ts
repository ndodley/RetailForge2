import { useMemo, useState } from "react"
import type { OrderRecord } from "../../types/store.ts"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel.tsx"

type SortKey = "best" | "total" | "date" | "user" | "status"
type SortOrder = "asc" | "desc"

export function useAdminOrderFilters(orders: OrderRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<SortKey>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [statusFilter, setStatusFilter] = useState<string>("All")

    function resetFilters() {
        setSearchTerm("")
        setSortBy("best")
        setSortOrder("asc")
        setStatusFilter("All")
    }

    const filterSections: FilterSection[] = useMemo(
        () => [
            {
                key: "sort",
                title: "Sort By",
                type: "radio",
                value: sortBy,
                onChange: (val) => setSortBy(String(val) as SortKey),
                options: [
                    { label: "Best Match", value: "best" },
                    { label: "Total", value: "total" },
                    { label: "Date", value: "date" },
                    { label: "User", value: "user" },
                    { label: "Status", value: "status" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (val) => setSortOrder(String(val) as SortOrder),
                options: [
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" },
                ],
            },
            {
                key: "status",
                title: "Status",
                type: "radio",
                value: statusFilter,
                onChange: (val) => setStatusFilter(String(val)),
                options: [
                    { label: "All", value: "All" },
                    { label: "Pending", value: "pending" },
                    { label: "Paid", value: "paid" },
                    { label: "Shipped", value: "shipped" },
                    { label: "Cancelled", value: "cancelled" },
                ],
            },
        ],
        [sortBy, sortOrder, statusFilter]
    )

    const visibleOrders = useMemo(() => {
        let filtered = [...orders]

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (o) =>
                    o.id.toString().includes(lower) ||
                    o.userEmail.toLowerCase().includes(lower) ||
                    o.status.toLowerCase().includes(lower)
            )
        }

        if (statusFilter !== "All") {
            filtered = filtered.filter((o) => o.status === statusFilter)
        }

        if (sortBy === "total") {
            filtered.sort((a, b) => a.total - b.total)
        } else if (sortBy === "date") {
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        } else if (sortBy === "user") {
            filtered.sort((a, b) => a.userEmail.localeCompare(b.userEmail))
        } else if (sortBy === "status") {
            filtered.sort((a, b) => a.status.localeCompare(b.status))
        }

        if (sortOrder === "desc") {
            filtered.reverse()
        }

        return filtered
    }, [orders, searchTerm, sortBy, sortOrder, statusFilter])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleOrders,
        resetFilters,
    }
}