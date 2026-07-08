import { useMemo, useState } from "react"
import type { ReviewRecord } from "../types/store"
import type { FilterSection } from "../components/common/AdvancedSearchPanel"

type SortField = "best" | "date" | "rating" | "product" | "user"
type SortOrder = "asc" | "desc"

export function useReviewFilters(reviews: ReviewRecord[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("best")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [productFilter, setProductFilter] = useState<string>("all")
    const [ratingFilter, setRatingFilter] = useState<string>("all")

    function resetFilters() {
        setSearchTerm("")
        setSortField("best")
        setSortOrder("asc")
        setProductFilter("all")
        setRatingFilter("all")
    }

    const reviewProductOptions = useMemo(() => {
        const seen = new Set<number>()
        return reviews
            .filter((r) => {
                if (seen.has(r.productId)) return false
                seen.add(r.productId)
                return true
            })
            .map((r) => ({ value: String(r.productId), label: r.productName }))
    }, [reviews])

    const filterSections: FilterSection[] = useMemo(
        () => [
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
                key: "product",
                title: "Product",
                type: "radio",
                value: productFilter,
                onChange: (v) => setProductFilter(String(v)),
                options: [
                    { value: "all", label: "All" },
                    ...reviewProductOptions,
                ],
            },
            {
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
            },
        ],
        [sortField, sortOrder, productFilter, ratingFilter, reviewProductOptions]
    )

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
    }, [reviews, searchTerm, sortField, sortOrder, productFilter, ratingFilter])

    return {
        searchTerm,
        setSearchTerm,
        filterSections,
        visibleReviews,
        resetFilters,
    }
}