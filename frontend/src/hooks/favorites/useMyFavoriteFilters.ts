import { useMemo, useState } from "react"
import type { StoreProductDto } from "../../api/products"
import type { CategoryDto } from "../../api/categories"
import type { DepartmentDto } from "../../api/departments"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel"

type SortField = "best" | "alpha" | "price" | "stock"
type SortOrder = "asc" | "desc"
type StockFilter = "any" | "in" | "out"

export function useMyFavoriteFilters(
    products: StoreProductDto[],
    categories: CategoryDto[] = [],
    departments: DepartmentDto[] = []
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [stockFilter, setStockFilter] = useState<StockFilter>("any")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setStockFilter("any")
        setDepartmentFilter("all")
        setCategoryFilter("all")
    }

    // Categories narrow to the selected department
    const availableCategories = useMemo(() => {
        if (departmentFilter === "all") return categories
        return categories.filter((c) => String(c.departmentId) === departmentFilter)
    }, [categories, departmentFilter])

    const filterSections: FilterSection[] = useMemo(() => {
        const sections: FilterSection[] = [
            {
                key: "sort",
                title: "Sort",
                type: "radio",
                value: sortField,
                onChange: (v) => setSortField(String(v) as SortField),
                options: [
                    { value: "best", label: "Best Match" },
                    { value: "alpha", label: "Alphabet" },
                    { value: "price", label: "Price" },
                    { value: "stock", label: "Stock" },
                ],
            },
            {
                key: "order",
                title: "Order",
                type: "radio",
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v) as SortOrder),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
            {
                key: "stock",
                title: "In Stock",
                type: "radio",
                value: stockFilter,
                onChange: (v) => setStockFilter(String(v) as StockFilter),
                options: [
                    { value: "any", label: "Any" },
                    { value: "in", label: "True" },
                    { value: "out", label: "False" },
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
                    { value: "all", label: "All Departments" },
                    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
                ],
            },
        ]

        // Category only becomes accessible once a real department is picked
        if (departmentFilter !== "all") {
            sections.push({
                key: "category",
                title: "Category",
                type: "radio",
                value: categoryFilter,
                onChange: (v) => setCategoryFilter(String(v)),
                options: [
                    { value: "all", label: "All Categories" },
                    ...availableCategories.map((c) => ({ value: String(c.id), label: c.name })),
                ],
            })
        }

        return sections
    }, [
        sortField, sortOrder, stockFilter,
        departmentFilter, categoryFilter,
        departments, availableCategories,
    ])

    const visibleProducts = useMemo(() => {
        let visible = [...products]

        const term = searchTerm.trim().toLowerCase()
        if (term) {
            visible = visible.filter((p) => p.name.toLowerCase().includes(term))
        }

        if (stockFilter === "in") {
            visible = visible.filter((p) => Number(p.stock ?? 0) > 0)
        }
        if (stockFilter === "out") {
            visible = visible.filter((p) => Number(p.stock ?? 0) <= 0)
        }

        if (categoryFilter !== "all") {
            visible = visible.filter((p) => String(p.categoryId) === categoryFilter)
        } else if (departmentFilter !== "all") {
            visible = visible.filter((p) => String(p.departmentId) === departmentFilter)
        }

        const multiplier = sortOrder === "asc" ? 1 : -1
        visible.sort((a, b) => {
            if (sortField === "alpha") return multiplier * a.name.localeCompare(b.name)
            if (sortField === "price") return multiplier * (Number(a.price ?? 0) - Number(b.price ?? 0))
            if (sortField === "stock") return multiplier * (Number(a.stock ?? 0) - Number(b.stock ?? 0))
            return 0
        })

        return visible
    }, [
        products, searchTerm, sortField, sortOrder, stockFilter,
        departmentFilter, categoryFilter,
    ])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleProducts,
        resetFilters,
    }
}
