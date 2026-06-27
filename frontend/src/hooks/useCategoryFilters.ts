import { useMemo, useState } from "react"
import type { CategoryRecord } from "../types/store"

type SortField = "best" | "alpha"
type SortDirection = "asc" | "desc"

export function useCategoryFilters(
    categories: CategoryRecord[],
    departments: { id: number; name: string }[],
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)

    const filterSections = useMemo(
        () => [
            {
                key: "sort",
                title: "Sort",
                type: "radio" as const,
                value: sortField,
                onChange: (value: string) =>
                    setSortField(value as SortField),
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
                onChange: (value: string) =>
                    setSortDirection(value as SortDirection),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
            {
                key: "department",
                title: "Department",
                type: "radio" as const,
                value: selectedDepartmentId?.toString() ?? "",
                onChange: (value: string) =>
                    setSelectedDepartmentId(value ? Number(value) : null),
                options: [
                    { value: "", label: "All Departments" },
                    ...departments.map((d) => ({
                        value: d.id.toString(),
                        label: d.name,
                    })),
                ],
            },
        ],
        [sortField, sortDirection, selectedDepartmentId, departments],
    )

    const visibleCategories = useMemo(() => {
        let next = [...categories]

        const q = searchTerm.trim().toLowerCase()
        if (q) {
            next = next.filter((c) => c.name.toLowerCase().includes(q))
        }

        if (selectedDepartmentId) {
            next = next.filter((c) => c.departmentId === selectedDepartmentId)
        }

        const direction = sortDirection === "asc" ? 1 : -1

        if (sortField === "alpha") {
            next = next.sort((a, b) => a.name.localeCompare(b.name) * direction)
        } else if (sortDirection === "desc") {
            next = next.reverse()
        }

        return next
    }, [categories, searchTerm, sortField, sortDirection, selectedDepartmentId])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleCategories,
    }
}
