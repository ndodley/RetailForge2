import { useMemo, useState } from "react"
import type { DepartmentDto } from "../api/departments"
import type { CategoryRecord } from "./useCategories"

type SortField = "best" | "alpha" | "dept"
type SortDirection = "asc" | "desc"
type DepartmentFilter = "all" | "unassigned" | `${number}`

export function useCategoryFilters(
    categories: CategoryRecord[],
    departments: DepartmentDto[],
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartment, setSelectedDepartment] =
        useState<DepartmentFilter>("all")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    const departmentOptions = useMemo(() => {
        const sorted = [...departments].sort((a, b) => a.name.localeCompare(b.name))
        return [
            { value: "all", label: "Any" },
            { value: "unassigned", label: "Unassigned" },
            ...sorted.map((d) => ({ value: String(d.id), label: d.name })),
        ]
    }, [departments])

    const filterSections = useMemo(
        () => [
            {
                key: "department",
                title: "Department",
                type: "radio" as const,
                value: selectedDepartment,
                onChange: (v: string | string[]) =>
                    setSelectedDepartment(String(v) as DepartmentFilter),
                options: departmentOptions,
            },
            {
                key: "sort",
                title: "Sort",
                type: "radio" as const,
                value: sortField,
                onChange: (v: string | string[]) =>
                    setSortField(String(v) as SortField),
                options: [
                    { value: "best", label: "Best Match" },
                    { value: "alpha", label: "Alphabet" },
                    { value: "dept", label: "Department" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio" as const,
                value: sortDirection,
                onChange: (v: string | string[]) =>
                    setSortDirection(String(v) as SortDirection),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
        ],
        [departmentOptions, selectedDepartment, sortField, sortDirection],
    )

    const visibleCategories = useMemo(() => {
        let next = [...categories]

        // Department filter
        if (selectedDepartment !== "all") {
            if (selectedDepartment === "unassigned") {
                next = next.filter((c) => c.departmentId === null)
            } else {
                next = next.filter(
                    (c) => String(c.departmentId) === selectedDepartment,
                )
            }
        }

        // Search
        const q = searchTerm.trim().toLowerCase()
        if (q) {
            next = next.filter((c) => {
                return (
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q) ||
                    (c.departmentName ?? "").toLowerCase().includes(q)
                )
            })
        }

        // Sorting
        const dir = sortDirection === "asc" ? 1 : -1
        next.sort((a, b) => {
            if (sortField === "alpha") {
                return a.name.localeCompare(b.name) * dir
            }
            if (sortField === "dept") {
                return (a.departmentName ?? "").localeCompare(b.departmentName ?? "") * dir
            }
            return 0
        })

        return next
    }, [categories, selectedDepartment, searchTerm, sortField, sortDirection])

    return {
        searchTerm,
        setSearchTerm,
        selectedDepartment,
        setSelectedDepartment,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        filterSections,
        visibleCategories,
    }
}
