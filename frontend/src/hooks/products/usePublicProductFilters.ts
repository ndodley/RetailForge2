import { useMemo, useState } from "react"
import type { StoreProductDto } from "../../api/products.ts"
import type { CategoryDto } from "../../api/categories.ts"
import type { DepartmentDto } from "../../api/departments.ts"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel.tsx"

export function usePublicProductFilters(
    products: StoreProductDto[],
    categories: CategoryDto[],
    departments: DepartmentDto[]
) {
    const [search, setSearch] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [sortBy, setSortBy] = useState("best")
    const [sortOrder, setSortOrder] = useState("asc")
    const [stockFilter, setStockFilter] = useState("any")

    function resetFilters() {
        setSearch("")
        setSelectedDepartment("all")
        setSelectedCategory("all")
        setSortBy("best")
        setSortOrder("asc")
        setStockFilter("any")
    }

    // Categories narrow to the selected department
    const availableCategories = useMemo(() => {
        if (selectedDepartment === "all") return categories
        return categories.filter((c) => String(c.departmentId) === selectedDepartment)
    }, [categories, selectedDepartment])

    const filterSections: FilterSection[] = useMemo(() => {
        const sections: FilterSection[] = [
            {
                key: "sort",
                title: "Sort",
                type: "radio",
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
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
                onChange: (v) => setSortOrder(String(v)),
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                ],
            },
            {
                key: "department",
                title: "Department",
                type: "radio",
                value: selectedDepartment,
                onChange: (v) => {
                    setSelectedDepartment(String(v))
                    setSelectedCategory("all")
                },
                options: [
                    { value: "all", label: "All Departments" },
                    ...departments.map((d) => ({
                        value: String(d.id),
                        label: d.name,
                    })),
                ],
            },
        ]

        // Category only becomes accessible once a real department is picked
        if (selectedDepartment !== "all") {
            sections.push({
                key: "category",
                title: "Category",
                type: "radio",
                value: selectedCategory,
                onChange: (v) => setSelectedCategory(String(v)),
                options: [
                    { value: "all", label: "All Categories" },
                    ...availableCategories.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                    })),
                ],
            })
        }

        sections.push({
            key: "stock",
            title: "In Stock",
            type: "radio",
            value: stockFilter,
            onChange: (v) => setStockFilter(String(v)),
            options: [
                { value: "any", label: "Any" },
                { value: "in", label: "True" },
                { value: "out", label: "False" },
            ],
        })

        return sections
    }, [
        sortBy, sortOrder, stockFilter,
        selectedDepartment, selectedCategory,
        departments, availableCategories,
    ])

    const filteredProducts = useMemo(() => {
        let list = [...products]

        if (selectedCategory !== "all") {
            list = list.filter((p) => String(p.categoryId) === selectedCategory)
        } else if (selectedDepartment !== "all") {
            list = list.filter((p) => String(p.departmentId) === selectedDepartment)
        }

        if (search.trim()) {
            const term = search.toLowerCase()
            list = list.filter((p) => p.name.toLowerCase().includes(term))
        }

        if (stockFilter === "in") {
            list = list.filter((p) => Number(p.stock ?? 0) > 0)
        }

        if (stockFilter === "out") {
            list = list.filter((p) => Number(p.stock ?? 0) <= 0)
        }

        const multiplier = sortOrder === "asc" ? 1 : -1

        return list.sort((a, b) => {
            if (sortBy === "alpha") return multiplier * a.name.localeCompare(b.name)
            if (sortBy === "price") return multiplier * (Number(a.price) - Number(b.price))
            if (sortBy === "stock") return multiplier * (Number(a.stock) - Number(b.stock))
            return 0
        })
    }, [products, search, selectedDepartment, selectedCategory, sortBy, sortOrder, stockFilter])

    return {
        search,
        setSearch,
        filterSections,
        filteredProducts,
        resetFilters,
    }
}
