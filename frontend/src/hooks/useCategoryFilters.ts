import { useMemo, useState } from "react"
import type { CategoryRecord } from "../types/store"
import type { FilterSection } from "../components/common/AdvancedSearchPanel"

type SortField = "best" | "alpha"
type SortOrder = "asc" | "desc"

export function useCategoryFilters(
    categories: CategoryRecord[],
    departments: { id: number; name: string }[]
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setSelectedDepartmentId(null)
    }

    const filterSections: FilterSection[] = useMemo(
        () => [
            {
                key: "sort",
                title: "Sort By",
                type: "radio",
                value: sortField,
                onChange: (value) => setSortField(String(value) as SortField),
                options: [
                    { value: "best", label: "Best Match" },
                    { value: "alpha", label: "Alphabet" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (value) => setSortOrder(String(value) as SortOrder),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
            {
                key: "department",
                title: "Department",
                type: "radio",
                value: selectedDepartmentId?.toString() ?? "",
                onChange: (value) =>
                    setSelectedDepartmentId(String(value) ? Number(value) : null),
                options: [
                    { value: "", label: "All Departments" },
                    ...departments.map((d) => ({
                        value: d.id.toString(),
                        label: d.name,
                    })),
                ],
            },
        ],
        [sortField, sortOrder, selectedDepartmentId, departments]
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

        const direction = sortOrder === "asc" ? 1 : -1

        if (sortField === "alpha") {
            next = next.sort((a, b) => a.name.localeCompare(b.name) * direction)
        } else if (sortOrder === "desc") {
            next = next.reverse()
        }

        return next
    }, [categories, searchTerm, sortField, sortOrder, selectedDepartmentId])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleCategories,
        resetFilters,
    }
}