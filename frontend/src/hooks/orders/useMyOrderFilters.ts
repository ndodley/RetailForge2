import { useMemo, useState } from "react"
import type { OrderRecord } from "../../types/store"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel"

export function useMyOrderFilters(orders: OrderRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("any")
    const [sortField, setSortField] = useState<"date" | "total" | "id">("date")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    function resetFilters() {
        setSearchTerm("")
        setStatusFilter("any")
        setSortField("date")
        setSortOrder("asc")
    }

    const filterSections: FilterSection[] = useMemo(
        () => [
            {
                key: "status",
                title: "Status",
                type: "radio",
                value: statusFilter,
                onChange: (v) => setStatusFilter(String(v)),
                options: [
                    { value: "any", label: "Any" },
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                    { value: "shipped", label: "Shipped" },
                    { value: "cancelled", label: "Cancelled" },
                ],
            },
            {
                key: "sort",
                title: "Sort",
                type: "radio",
                value: sortField,
                onChange: (v) => setSortField(String(v) as "date" | "total" | "id"),
                options: [
                    { value: "date", label: "Date" },
                    { value: "total", label: "Total" },
                    { value: "id", label: "Order ID" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v) as "asc" | "desc"),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
        ],
        [statusFilter, sortField, sortOrder]
    )

    const visibleOrders = useMemo(() => {
        let filtered = [...orders]

        const term = searchTerm.trim().toLowerCase()
        if (term) {
            filtered = filtered.filter(
                (o) =>
                    String(o.id).includes(term) ||
                    o.status.toLowerCase().includes(term) ||
                    o.shippingAddress.toLowerCase().includes(term)
            )
        }

        if (statusFilter !== "any") {
            filtered = filtered.filter((o) => o.status.toLowerCase() === statusFilter)
        }

        const multiplier = sortOrder === "asc" ? 1 : -1

        filtered.sort((a, b) => {
            if (sortField === "total") return multiplier * (a.total - b.total)
            if (sortField === "id") return multiplier * (a.id - b.id)
            return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        })

        return filtered
    }, [orders, searchTerm, statusFilter, sortField, sortOrder])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleOrders,
        resetFilters,
    }
}