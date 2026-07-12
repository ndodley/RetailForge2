import { useMemo, useState } from "react"
import type { DepartmentRecord } from "../../types/store.ts"

type SortField = "best" | "alpha"
type SortOrder = "asc" | "desc"

export function useAdminDepartmentFilters(departments: DepartmentRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
    }


    const filterSections = useMemo(
        () => [
            {
                key: "sort",
                title: "Sort",
                type: "radio" as const,
                value: sortField,
                onChange: (value: string | string[]) =>
                    setSortField(String(value) as SortField),
                options: [
                    { value: "best", label: "Best Match" },
                    { value: "alpha", label: "Alphabet" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio" as const,
                value: sortOrder,
                onChange: (value: string | string[]) =>
                    setSortOrder(String(value) as SortOrder),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
        ],
        [sortOrder, sortField],
    )

    const visibleDepartments = useMemo(() => {
        let next = Array.isArray(departments) ? departments : []
        const normalizedQuery = searchTerm.trim().toLowerCase()

        if (normalizedQuery) {
            next = next.filter((department) =>
                department.name.toLowerCase().includes(normalizedQuery),
            )
        }

        const direction = sortOrder === "asc" ? 1 : -1

        if (sortField === "alpha") {
            next = [...next].sort(
                (left, right) => left.name.localeCompare(right.name) * direction,
            )
        } else if (sortOrder === "desc") {
            next = [...next].reverse()
        }

        return next
    }, [departments, searchTerm, sortOrder, sortField])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleDepartments,
        resetFilters,
    }
}
