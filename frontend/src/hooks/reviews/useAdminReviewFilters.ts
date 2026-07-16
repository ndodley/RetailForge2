import { useMemo, useState } from "react"
import type { ReviewRecord } from "../../types/store.ts"
import type { FilterSection } from "../../components/common/AdvancedSearchPanel.tsx"
import type { ProductAdminDto } from "../../api/productAdminApi.ts"
import type { CategoryDto } from "../../api/categories.ts"
import type { DepartmentDto } from "../../api/departments.ts"

type SortField = "best" | "date" | "rating" | "product" | "user"
type SortOrder = "asc" | "desc"

export function useAdminReviewFilters(
    reviews: ReviewRecord[],
    products: ProductAdminDto[] = [],
    categories: CategoryDto[] = [],
    departments: DepartmentDto[] = []
) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [productFilter, setProductFilter] = useState<string>("all")
    const [ratingFilter, setRatingFilter] = useState<string>("all")
    const [departmentFilter, setDepartmentFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setProductFilter("all")
        setRatingFilter("all")
        setDepartmentFilter("all")
        setCategoryFilter("all")
    }

    // productId -> product metadata, so a review can be traced to its department/category
    const productMetaById = useMemo(() => {
        const map = new Map<number, ProductAdminDto>()
        products.forEach((p) => map.set(p.id, p))
        return map
    }, [products])

    const reviewProductOptions = useMemo(() => {
        const seen = new Set<number>()
        const options: { value: string; label: string }[] = []

        for (const r of reviews) {
            if (seen.has(r.productId)) continue

            const meta = productMetaById.get(r.productId)
            if (departmentFilter !== "all" && String(meta?.departmentId) !== departmentFilter) continue
            if (categoryFilter !== "all" && String(meta?.categoryId) !== categoryFilter) continue

            seen.add(r.productId)
            options.push({ value: String(r.productId), label: r.productName })
        }

        return options
    }, [reviews, productMetaById, departmentFilter, categoryFilter])

    const availableCategories = useMemo(() => {
        if (departmentFilter === "all") return categories
        return categories.filter((c) => String(c.departmentId) === departmentFilter)
    }, [categories, departmentFilter])

    const filterSections: FilterSection[] = useMemo(() => {
        const sections: FilterSection[] = [
            {
                key: "sort",
                title: "Sort By",
                type: "radio",
                value: sortField,
                onChange: (v) => setSortField(String(v) as SortField),
                options: [
                    { value: "best", label: "Best Match" },
                    { value: "date", label: "Date" },
                    { value: "rating", label: "Rating" },
                    { value: "product", label: "Product" },
                    { value: "user", label: "User" },
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
                key: "department",
                title: "Department",
                type: "radio",
                value: departmentFilter,
                onChange: (v) => {
                    setDepartmentFilter(String(v))
                    setCategoryFilter("all")
                    setProductFilter("all")
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
                onChange: (v) => {
                    setCategoryFilter(String(v))
                    setProductFilter("all")
                },
                options: [
                    { value: "all", label: "All Categories" },
                    ...availableCategories.map((c) => ({ value: String(c.id), label: c.name })),
                ],
            })
        }

        // Product only becomes accessible once a real category is picked
        if (categoryFilter !== "all") {
            sections.push({
                key: "product",
                title: "Product",
                type: "radio",
                value: productFilter,
                onChange: (v) => setProductFilter(String(v)),
                options: [
                    { value: "all", label: "All" },
                    ...reviewProductOptions,
                ],
            })
        }

        sections.push({
            key: "rating",
            title: "Rating",
            type: "radio",
            value: ratingFilter,
            onChange: (v) => setRatingFilter(String(v)),
            options: [
                { value: "all", label: "All" },
                { value: "5", label: "5 Stars" },
                { value: "4", label: "4 Stars" },
                { value: "3", label: "3 Stars" },
                { value: "2", label: "2 Stars" },
                { value: "1", label: "1 Star" },
            ],
        })

        return sections
    }, [
        sortField, sortOrder, productFilter, ratingFilter, reviewProductOptions,
        departmentFilter, categoryFilter, departments, availableCategories,
    ])

    const visibleReviews = useMemo(() => {
        let filtered = [...reviews]

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (r) =>
                    r.comment?.toLowerCase().includes(term) ||
                    r.productName?.toLowerCase().includes(term) ||
                    r.userEmail?.toLowerCase().includes(term)
            )
        }

        if (productFilter !== "all") {
            filtered = filtered.filter((r) => String(r.productId) === productFilter)
        }

        if (ratingFilter !== "all") {
            const target = parseInt(ratingFilter)
            filtered = filtered.filter((r) => Math.round(r.rating) === target)
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((r) => {
                const meta = productMetaById.get(r.productId)
                return meta ? String(meta.categoryId) === categoryFilter : false
            })
        } else if (departmentFilter !== "all") {
            filtered = filtered.filter((r) => {
                const meta = productMetaById.get(r.productId)
                return meta ? String(meta.departmentId) === departmentFilter : false
            })
        }

        filtered = [...filtered].sort((a, b) => {
            let cmp = 0
            if (sortField === "best") cmp = b.rating - a.rating
            else if (sortField === "date") cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            else if (sortField === "rating") cmp = a.rating - b.rating
            else if (sortField === "product") cmp = a.productName.localeCompare(b.productName)
            else if (sortField === "user") cmp = a.userEmail.localeCompare(b.userEmail)
            return sortOrder === "desc" ? -cmp : cmp
        })

        return filtered
    }, [
        reviews, searchTerm, sortField, sortOrder, productFilter, ratingFilter,
        categoryFilter, departmentFilter, productMetaById,
    ])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    }
}