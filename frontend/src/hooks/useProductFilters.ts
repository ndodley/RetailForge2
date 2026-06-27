import { useMemo, useState } from "react"
import type { ProductRecord, CategoryRecord } from "../types/store"
import type { FilterSection } from "../components/common/AdvancedSearchPanel"

type SortField = "best" | "alpha" | "price" | "stock"
type SortOrder = "asc" | "desc"

export function useProductFilters(
    products: ProductRecord[],
    departments: { id: number; name: string }[],
    categories: CategoryRecord[]
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [departmentFilter, setDepartmentFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setDepartmentFilter("all")
        setCategoryFilter("all")
    }

    const filteredCategories = useMemo(() => {
        if (departmentFilter === "all") return categories
        return categories.filter(
            (c) => String(c.departmentId) === departmentFilter
        )
    }, [categories, departmentFilter])

    const filterSections: FilterSection[] = [
        {
            key: "sort",
            title: "Sort By",
            type: "radio",
            value: sortField,
            onChange: (v) => setSortField(String(v) as SortField),
            options: [
                { label: "Best Match", value: "best" },
                { label: "Alphabet", value: "alpha" },
                { label: "Price", value: "price" },
                { label: "Stock", value: "stock" },
            ],
        },
        {
            key: "order",
            title: "Order",
            type: "radio",
            value: sortOrder,
            onChange: (v) => setSortOrder(String(v) as SortOrder),
            options: [
                { label: "Ascending", value: "asc" },
                { label: "Descending", value: "desc" },
            ],
        },
        {
            key: "department",
            title: "Department",
            type: "radio",
            value: departmentFilter,
            onChange: (v) => {
                setDepartmentFilter(String(v))
                setCategoryFilter("all")
            },
            options: [
                { label: "All Departments", value: "all" },
                ...departments.map((d) => ({
                    label: d.name,
                    value: String(d.id),
                })),
            ],
        },
        {
            key: "category",
            title: "Category",
            type: "radio",
            value: categoryFilter,
            onChange: (v) => setCategoryFilter(String(v)),
            options: [
                { label: "All Categories", value: "all" },
                ...filteredCategories.map((c) => ({
                    label: c.name,
                    value: String(c.id),
                })),
            ],
        },
    ]

    const visibleProducts = useMemo(() => {
        let filtered = [...products]

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.brand?.toLowerCase().includes(term) ||
                    p.categoryName?.toLowerCase().includes(term) ||
                    p.departmentName?.toLowerCase().includes(term)
            )
        }

        if (departmentFilter !== "all") {
            filtered = filtered.filter(
                (p) => String(p.departmentId) === departmentFilter
            )
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter(
                (p) => String(p.categoryId) === categoryFilter
            )
        }

        filtered.sort((a, b) => {
            let comparison = 0

            if (sortField === "best") comparison = b.rating - a.rating
            else if (sortField === "alpha") comparison = a.name.localeCompare(b.name)
            else if (sortField === "price") comparison = a.price - b.price
            else if (sortField === "stock") comparison = a.stock - b.stock

            return sortOrder === "desc" ? -comparison : comparison
        })

        return filtered
    }, [
        products,
        searchTerm,
        sortField,
        sortOrder,
        departmentFilter,
        categoryFilter,
    ])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleProducts,
        resetFilters,
    }
}
