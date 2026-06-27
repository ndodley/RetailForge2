import { useMemo, useState } from "react"
import type { DepartmentRecord } from "../types/store"

type SortField = "best" | "alpha"
type SortDirection = "asc" | "desc"

export function useDepartmentFilters(departments: DepartmentRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

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
                value: sortDirection,
                onChange: (value: string | string[]) =>
                    setSortDirection(String(value) as SortDirection),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
        ],
        [sortDirection, sortField],
    )

    const visibleDepartments = useMemo(() => {
        let next = Array.isArray(departments) ? departments : []
        const normalizedQuery = searchTerm.trim().toLowerCase()

        if (normalizedQuery) {
            next = next.filter((department) =>
                department.name.toLowerCase().includes(normalizedQuery),
            )
        }

        const direction = sortDirection === "asc" ? 1 : -1

        if (sortField === "alpha") {
            next = [...next].sort(
                (left, right) => left.name.localeCompare(right.name) * direction,
            )
        } else if (sortDirection === "desc") {
            next = [...next].reverse()
        }

        return next
    }, [departments, searchTerm, sortDirection, sortField])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleDepartments,
    }
}
